"use strict";(self.webpackChunksakai_ng=self.webpackChunksakai_ng||[]).push([[6250],{6250:(O,C,a)=>{a.r(C),a.d(C,{NestedAppAuthController:()=>m});var d=a(5861),k=a(8214),f=a(7979),I=a(4441),l=a(8593),U=a(7883),w=a(8404),E=a(5500),N=a(9092),h=a(5140),A=a(5841),y=a(9082),S=a(4498),P=a(544),v=a(7481);class B{constructor(e,t,s,r){this.clientId=e,this.clientCapabilities=t,this.crypto=s,this.logger=r}toNaaTokenRequest(e){let t;t=void 0===e.extraQueryParameters?new Map:new Map(Object.entries(e.extraQueryParameters));const r=(new w.H).addClientCapabilitiesToClaims(e.claims,this.clientCapabilities),o=e.scopes||E.f_;return{platformBrokerId:e.account?.homeAccountId,clientId:this.clientId,authority:e.authority,scope:o.join(" "),correlationId:void 0!==e.correlationId?e.correlationId:this.crypto.createNewGuid(),claims:N.x.isEmptyObj(r)?void 0:r,state:e.state,authenticationScheme:e.authenticationScheme||E.hO.BEARER,extraParameters:t}}fromNaaTokenResponse(e,t,s){if(!t.token.id_token||!t.token.access_token)throw(0,h.zP)(A.PM);const r=new Date(1e3*(s+(t.token.expires_in||0))),o=y.Z_(t.token.id_token,this.crypto.base64Decode),c=this.fromNaaAccountInfo(t.account,o);return{authority:t.token.authority||c.environment,uniqueId:c.localAccountId,tenantId:c.tenantId,scopes:(t.token.scope||e.scope).split(" "),account:c,idToken:t.token.id_token,idTokenClaims:o,accessToken:t.token.access_token,fromCache:!0,expiresOn:r,tokenType:e.authenticationScheme||E.hO.BEARER,correlationId:e.correlationId,extExpiresOn:r,state:e.state}}fromNaaAccountInfo(e,t){const s=t||e.idTokenClaims,r=e.localAccountId||s?.oid||s?.sub||"",o=e.tenantId||s?.tid||"";return{homeAccountId:e.homeAccountId||`${r}.${o}`,environment:e.environment,tenantId:o,username:e.username||s?.preferred_username||"",localAccountId:r,name:e.name||s?.name,idToken:e.idToken,idTokenClaims:s}}fromBridgeError(e){if(!function x(R){return void 0!==R.status}(e))return new v.l4("unknown_error","An unknown error occurred");switch(e.status){case"USER_CANCEL":return new h.er(A.$R);case"NO_NETWORK":return new h.er(A.Mq);case"ACCOUNT_UNAVAILABLE":return new h.er(A.cX);case"DISABLED":return new h.er(A.Ls);case"NESTED_APP_AUTH_UNAVAILABLE":return new h.er(e.code||A.Ls,e.description);case"TRANSIENT_ERROR":case"PERSISTENT_ERROR":return new S.n(e.code,e.description);case"USER_INTERACTION_REQUIRED":return new P.Yo(e.code,e.description);default:return new v.l4(e.code,e.description)}}}const T_unsupportedMethod_code="unsupported_method",T_unsupportedMethod_desc="The PKCE code challenge and verifier could not be generated.";class n extends v.l4{constructor(e,t){super(e,t),Object.setPrototypeOf(this,n.prototype),this.name="NestedAppAuthError"}static createUnsupportedError(){return new n(T_unsupportedMethod_code,T_unsupportedMethod_desc)}}var b=a(4076),g=a(6097);class m{constructor(e){this.operatingContext=e;const t=this.operatingContext.getBridgeProxy();if(void 0===t)throw new Error("unexpected: bridgeProxy is undefined");this.bridgeProxy=t,this.config=e.getConfig(),this.logger=this.operatingContext.getLogger(),this.performanceClient=this.config.telemetry.client,this.browserCrypto=e.isBrowserEnvironment()?new U.Q(this.logger,this.performanceClient):k.d,this.eventHandler=new b.b(this.logger,this.browserCrypto),this.nestedAppAuthAdapter=new B(this.config.auth.clientId,this.config.auth.clientCapabilities,this.browserCrypto,this.logger)}getBrowserStorage(){throw n.createUnsupportedError()}getEventHandler(){return this.eventHandler}static createController(e){return(0,d.Z)(function*(){const t=new m(e);return Promise.resolve(t)})()}initialize(){return Promise.resolve()}ensureValidRequest(e){return e?.correlationId?e:{...e,correlationId:this.browserCrypto.createNewGuid()}}acquireTokenInteractive(e){var t=this;return(0,d.Z)(function*(){const s=t.ensureValidRequest(e);t.eventHandler.emitEvent(g.t.ACQUIRE_TOKEN_START,l.s_.Popup,s);const r=t.performanceClient.startMeasurement(f.Ak.AcquireTokenPopup,s.correlationId);r?.add({nestedAppAuthRequest:!0});try{const o=t.nestedAppAuthAdapter.toNaaTokenRequest(s),c=I.HY(),p=yield t.bridgeProxy.getTokenInteractive(o),i=t.nestedAppAuthAdapter.fromNaaTokenResponse(o,p,c);return t.operatingContext.setActiveAccount(i.account),t.eventHandler.emitEvent(g.t.ACQUIRE_TOKEN_SUCCESS,l.s_.Popup,i),r.add({accessTokenSize:i.accessToken.length,idTokenSize:i.idToken.length}),r.end({success:!0,requestId:i.requestId}),i}catch(o){const c=t.nestedAppAuthAdapter.fromBridgeError(o);throw t.eventHandler.emitEvent(g.t.ACQUIRE_TOKEN_FAILURE,l.s_.Popup,null,o),r.end({success:!1},o),c}})()}acquireTokenSilentInternal(e){var t=this;return(0,d.Z)(function*(){const s=t.ensureValidRequest(e);t.eventHandler.emitEvent(g.t.ACQUIRE_TOKEN_START,l.s_.Silent,s);const r=t.performanceClient.startMeasurement(f.Ak.SsoSilent,s.correlationId);r?.increment({visibilityChangeCount:0}),r?.add({nestedAppAuthRequest:!0});try{const o=t.nestedAppAuthAdapter.toNaaTokenRequest(s),c=I.HY(),p=yield t.bridgeProxy.getTokenSilent(o),i=t.nestedAppAuthAdapter.fromNaaTokenResponse(o,p,c);return t.operatingContext.setActiveAccount(i.account),t.eventHandler.emitEvent(g.t.ACQUIRE_TOKEN_SUCCESS,l.s_.Silent,i),r?.add({accessTokenSize:i.accessToken.length,idTokenSize:i.idToken.length}),r?.end({success:!0,requestId:i.requestId}),i}catch(o){const c=t.nestedAppAuthAdapter.fromBridgeError(o);throw t.eventHandler.emitEvent(g.t.ACQUIRE_TOKEN_FAILURE,l.s_.Silent,null,o),r?.end({success:!1},o),c}})()}acquireTokenPopup(e){var t=this;return(0,d.Z)(function*(){return t.acquireTokenInteractive(e)})()}acquireTokenRedirect(e){throw n.createUnsupportedError()}acquireTokenSilent(e){var t=this;return(0,d.Z)(function*(){return t.acquireTokenSilentInternal(e)})()}acquireTokenByCode(e){throw n.createUnsupportedError()}acquireTokenNative(e,t,s){throw n.createUnsupportedError()}acquireTokenByRefreshToken(e,t){throw n.createUnsupportedError()}addEventCallback(e){return this.eventHandler.addEventCallback(e)}removeEventCallback(e){this.eventHandler.removeEventCallback(e)}addPerformanceCallback(e){throw n.createUnsupportedError()}removePerformanceCallback(e){throw n.createUnsupportedError()}enableAccountStorageEvents(){throw n.createUnsupportedError()}disableAccountStorageEvents(){throw n.createUnsupportedError()}getAccount(e){throw n.createUnsupportedError()}getAccountByHomeId(e){const t=this.operatingContext.getActiveAccount();return void 0!==t&&t.homeAccountId===e?this.nestedAppAuthAdapter.fromNaaAccountInfo(t):null}getAccountByLocalId(e){const t=this.operatingContext.getActiveAccount();return void 0!==t&&t.localAccountId===e?this.nestedAppAuthAdapter.fromNaaAccountInfo(t):null}getAccountByUsername(e){const t=this.operatingContext.getActiveAccount();return void 0!==t&&t.username===e?this.nestedAppAuthAdapter.fromNaaAccountInfo(t):null}getAllAccounts(){const e=this.operatingContext.getActiveAccount();return void 0!==e?[this.nestedAppAuthAdapter.fromNaaAccountInfo(e)]:[]}handleRedirectPromise(e){return Promise.resolve(null)}loginPopup(e){return this.acquireTokenInteractive(e||l.yo)}loginRedirect(e){throw n.createUnsupportedError()}logout(e){throw n.createUnsupportedError()}logoutRedirect(e){throw n.createUnsupportedError()}logoutPopup(e){throw n.createUnsupportedError()}ssoSilent(e){return this.acquireTokenSilentInternal(e)}getTokenCache(){throw n.createUnsupportedError()}getLogger(){return this.logger}setLogger(e){this.logger=e}setActiveAccount(e){this.logger.warning("nestedAppAuth does not support setActiveAccount")}getActiveAccount(){const e=this.operatingContext.getActiveAccount();return void 0!==e?this.nestedAppAuthAdapter.fromNaaAccountInfo(e):null}initializeWrapperLibrary(e,t){}setNavigationClient(e){this.logger.warning("setNavigationClient is not supported in nested app auth")}getConfiguration(){return this.config}isBrowserEnv(){return this.operatingContext.isBrowserEnvironment()}getBrowserCrypto(){return this.browserCrypto}getPerformanceClient(){throw n.createUnsupportedError()}getRedirectResponse(){throw n.createUnsupportedError()}clearCache(e){return(0,d.Z)(function*(){throw n.createUnsupportedError()})()}hydrateCache(e,t){return(0,d.Z)(function*(){throw n.createUnsupportedError()})()}}}}]);