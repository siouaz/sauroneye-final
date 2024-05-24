using System;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Web;
using OeuilDeSauron.Data.Identity;
using OeuilDeSauron.Domain;
using OeuilDeSauron.Domain.Identity;
using OeuilDeSauron.Domain.Queries;
using OeuilDeSauron.Infrastructure.Mail;
using Z.Expressions;

namespace OeuilDeSauron.Controllers.Identity;

/// <summary>
/// Authentication controller.
/// </summary>
[ApiController]
[Route("api/authentication")]
public class AuthenticationController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IMailer _mailer;
    private readonly IResources _resources;
    private readonly SignInManager<User> _signInManager;
    private readonly UserManager<User> _userManager;
    private readonly IUserQueries _userQueries;
    private readonly IOptionsMonitor<MicrosoftIdentityOptions> _optionsMonitor;

    private IdentityOptions Options { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthenticationController"/> class.
    /// </summary>
    public AuthenticationController(IConfiguration configuration/*, IMailer mailer*/, IOptions<IdentityOptions> options,
        IResources resources,
        SignInManager<User> signInManager,
        UserManager<User> userManager,
        IUserQueries userQueries,
        IOptionsMonitor<MicrosoftIdentityOptions> microsoftIdentityOptionsMonitor)
    {
        _configuration = configuration;
        //_mailer = mailer;
        _resources = resources;
        _signInManager = signInManager;
        _userManager = userManager;
        _userQueries = userQueries;
        _optionsMonitor = microsoftIdentityOptionsMonitor;

        Options = options.Value;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(Login model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = _resources.LoginIncorrectCredentials });
        }

        var user = await _userManager.FindByEmailAsync(model.Username) ??
                   await _userManager.FindByNameAsync(model.Username) ??
                   await _userManager.FindByLoginAsync(LoginProviders.Legacy, model.Username);

        if (user is null)
        {
            return BadRequest(new { error = _resources.LoginIncorrectCredentials });
        }

        var result = await _signInManager.PasswordSignInAsync(user, model.Password, false, true);

        if (result.Succeeded)
        {
            return Ok(new LoginResult());
        }

        if (result.IsLockedOut)
        {
            var remainingLockedTime = user.LockoutEnd!.Value - DateTimeOffset.UtcNow;
            // If superior to 1 hour (locked out on retry is 1 hour), then user is disabled, returns generic answer.
            if (remainingLockedTime.Hours > 1)
            {
                return BadRequest(new { error = _resources.UserDisabled });
            }

            // If less than 1 hour, notify remaining locked time.
            return Ok(new LoginResult(false, user.LockoutEnd, _resources.UserLocked));
        }

        return BadRequest(new { error = _resources.LoginIncorrectCredentials });
    }

    /// <summary>
    /// Terminates the user session.
    /// </summary>
    [HttpPost("logout")]
    public async Task Logout() => await _signInManager.SignOutAsync();

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPassword model)
    {
        var user = await _userManager.FindByEmailAsync(model.UserName) ??
                   await _userManager.FindByNameAsync(model.UserName) ??
                   await _userManager.FindByLoginAsync(LoginProviders.Legacy, model.UserName);

        if (user is null)
        {
            return BadRequest(new { error = _resources.UserNotFound });
        }

        if (user.Email is null)
        {
            return BadRequest(new { error = _resources.UserWithoutEmail });
        }

        if (user.IsLockedOut)
        {
            return BadRequest(new { error = _resources.UserLocked });
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        var message = new MailMessage
        {
            Subject = string.Format(CultureInfo.CurrentCulture, _resources.ResetPasswordEmailSubject),
            From = new MailAddress(_configuration.GetValue<string>("Mail:From"), "Pulvés")
        };
        message.To.Add(new MailAddress(user.Email, $"{user.FirstName} {user.LastName}"));

        await _mailer.SendAsync(new ResetPasswordEmail(user.Id, user.FirstName, user.LastName,
                $"{Request.Scheme}://{Request.Host}/reset-password/{user.Id}/{WebUtility.UrlEncode(token)}"),
            "ResetPassword", message);

        return Ok();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPassword model)
    {
        var user = await _userManager.FindByIdAsync(model.Id);
        if (user is null)
        {
            return BadRequest(new { error = _resources.UserNotFound });
        }

        var result = await _userManager.ResetPasswordAsync(user, model.Token, model.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Code);
            return BadRequest(new { Errors = errors });
        }

        return Ok();
    }

    [HttpPost("reset-password/token/verify")]
    public async Task<IActionResult> VerifyResetPasswordToken([FromBody] ResetPasswordBase model)
    {
        var user = await _userManager.FindByIdAsync(model.Id);

        if (user is null)
        {
            return BadRequest();
        }

        if (!await _userManager.VerifyUserTokenAsync(user, Options.Tokens.PasswordResetTokenProvider,
                UserManager<User>.ResetPasswordTokenPurpose, model.Token))
        {
            return BadRequest();
        }

        return NoContent();
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePassword model)
    {
        var user = await _userManager.FindByIdAsync(model.UserId);
        if (user is null)
        {
            return BadRequest(new { Errors = _resources.UserNotFound });
        }

        if (!await _userManager.CheckPasswordAsync(user, model.OldPassword))
        {
            return BadRequest(new { Errors = _resources.OldPasswordIncorrect });
        }

        var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Code);
            return BadRequest(new { Errors = errors });
        }

        return Ok();
    }

    /// <summary>
    /// Initiates an external authentication challenge.
    /// </summary>
    /// <param name="provider">Provider name.</param>
    /// <param name="returnUrl">Post-authentication url to redirect to.</param>
    [HttpPost("external-login")]
    public IActionResult ExternalLogin(string provider, string returnUrl)
    {
        // Request a redirect to the external login provider.
        var request = Request.Form;
        // provider ??= request["provider"];

        var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Authentication",
            new { ReturnUrl = returnUrl });

        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
        return Challenge(properties, provider);
    }
   


    /// <summary>
    /// Finishes the external authentication process.
    /// </summary>
    /// <param name="returnUrl">Post-authentication url to redirect to.</param>
    /// <param name="remoteError">External provider thrown error, if any.</param>
    [HttpGet("external-login/callback")]
    public async Task<IActionResult> ExternalLoginCallback(string returnUrl = null, string remoteError = null)
    {
        if (remoteError != null)
        {
            ModelState.AddModelError(string.Empty, $"Error from external provider: {remoteError}");

            return BadRequest(ModelState);
        }

        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            ModelState.AddModelError(string.Empty, $"Error getting external login info");

            return BadRequest(ModelState);
        }

        var result =
            await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: true);
        if (result.Succeeded)
        {
            //_logger.LogInformation(1, "User logged in with {Name} provider.", info.LoginProvider);

            return RedirectToLocal(returnUrl);
        }
        else
        {
            // Internal users have upn claim
            // External users have email claim
            var name = info.Principal.FindFirstValue(ClaimTypes.Upn) ??
                       info.Principal.FindFirstValue(ClaimTypes.Email);

            Console.WriteLine($"Extracted Name: {name}");

            if (string.IsNullOrEmpty(name))
            {
                // Log the claims if name is null
                var claims = info.Principal.Claims;
                foreach (var claim in claims)
                {
                    Console.WriteLine($"Claim Type: {claim.Type}, Claim Value: {claim.Value}");
                }
                ModelState.AddModelError(string.Empty, "Name claim not found");
                return BadRequest(ModelState);
            }
           
            var user =  await _userManager.FindByEmailAsync(name);

            if (user is null)
            {
                user = new User { UserName = name, Email = name };
                await _userManager.CreateAsync(user);
            }

            await _userManager.AddLoginAsync(user, info);
            await _signInManager.SignInAsync(user, false);

            return RedirectToLocal(returnUrl);
        }
    }

    //[HttpGet("azure-login")]
   // public IActionResult Login(string returnUrl = "/")
   // {
       // var scheme = OpenIdConnectDefaults.AuthenticationScheme;
       // string redirect;
       // if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
       // {
           // redirect = returnUrl;
        //}
       // else
       //{
           // redirect = Url.Content("~/")!;
      //  }

      //  return Challenge(
            //new AuthenticationProperties { RedirectUri = redirect },
            //scheme);
   // }

   


    [HttpGet("external-login-callback")]
    public async Task<IActionResult> ExternalLoginCallback(string returnUrl = "/")
    {
        var result = await HttpContext.AuthenticateAsync(OpenIdConnectDefaults.AuthenticationScheme);
        if (result?.Succeeded != true)
        {
            return BadRequest(new { error = "Failed to authenticate with Azure AD." });
        }

        // Use the user's identity information here, e.g., result.Principal.Identity.Name

        return LocalRedirect(returnUrl);
    }
    #region Helpers

    private void AddErrors(IdentityResult result)
    {
        foreach (var error in result.Errors)
        {
            ModelState.AddModelError(string.Empty, error.Description);
        }
    }

    private IActionResult RedirectToLocal(string returnUrl)
    {
        if (Url.IsLocalUrl(returnUrl))
        {
            return Redirect(returnUrl);
        }

        return RedirectToAction(nameof(AppController.Index), "App");
    }

    #endregion
}
