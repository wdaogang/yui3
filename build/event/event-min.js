(function(){var E=YUI.Env,G=YUI.config,F=G.doc,B=G.pollInterval||20,A=function(C){E._ready();};if(!E._ready){E.windowLoaded=false;E._ready=function(){if(!E.DOMReady){E.DOMReady=true;if(F.removeEventListener){F.removeEventListener("DOMContentLoaded",A,false);}}};if(navigator.userAgent.match(/MSIE/)){E._dri=setInterval(function(){try{document.documentElement.doScroll("left");clearInterval(E._dri);E._dri=null;A();}catch(C){}},B);}else{F.addEventListener("DOMContentLoaded",A,false);}}})();YUI.add("event",function(D){(function(){var G=YUI.Env,E=D.Env.evt.plugins,F=function(){D.fire("domready");};D.mix(E,{domready:{},"event:ready":{on:function(){var H=D.Array(arguments,0,true);H[0]="domready";return D.subscribe.apply(D,H);},detach:function(){var H=D.Array(arguments,0,true);H[0]="domready";return D.unsubscribe.apply(D,H);}}});D.publish("domready",{fireOnce:true});if(G.DOMReady){F();}else{D.before(F,G,"_ready");}})();(function(){var G={altKey:1,cancelBubble:1,ctrlKey:1,clientX:1,clientY:1,detail:1,keyCode:1,metaKey:1,shiftKey:1,type:1,x:1,y:1},F=D.UA,E={63232:38,63233:40,63234:37,63235:39,63276:33,63277:34,25:9},H=function(J){if(!J){return null;}try{if(F.webkit&&3==J.nodeType){J=J.parentNode;}}catch(I){}return D.Node.get(J);};D.DOMEventFacade=function(S,K,J,I){var O=S,M=K,P=D.config.doc,T=P.body,U=O.pageX,R=O.pageY,L=(S._YUI_EVENT),N,Q,V;for(N in G){if(G.hasOwnProperty(N)){this[N]=O[N];}}if(!U&&0!==U){U=O.clientX||0;R=O.clientY||0;if(F.ie){U+=Math.max(P.documentElement.scrollLeft,T.scrollLeft);R+=Math.max(P.documentElement.scrollTop,T.scrollTop);}}this._yuifacade=true;this.pageX=U;this.pageY=R;Q=O.keyCode||O.charCode||0;if(F.webkit&&(Q in E)){Q=E[Q];}this.keyCode=Q;this.charCode=Q;this.button=O.which||O.button;this.which=this.button;this.details=I;this.time=O.time||new Date().getTime();this.target=(L)?O.target:H(O.target||O.srcElement);this.currentTarget=(L)?M:H(M);V=O.relatedTarget;if(!V){if(O.type=="mouseout"){V=O.toElement;}else{if(O.type=="mouseover"){V=O.fromElement;}}}this.relatedTarget=(L)?V:H(V);this.stopPropagation=function(){if(O.stopPropagation){O.stopPropagation();}else{O.cancelBubble=true;}if(J){J.stopPropagation();}};this.stopImmediatePropagation=function(){if(O.stopImmediatePropagation){O.stopImmediatePropagation();}else{this.stopPropagation();}if(J){J.stopImmediatePropagation();}};this.preventDefault=function(){if(O.preventDefault){O.preventDefault();}else{O.returnValue=false;}if(J){J.preventDefault();}};this.halt=function(W){if(W){this.stopImmediatePropagation();}else{this.stopPropagation();}this.preventDefault();};};})();(function(){var K=function(P,O,N,M){if(P.addEventListener){P.addEventListener(O,N,!!M);}else{if(P.attachEvent){P.attachEvent("on"+O,N);}}},E=function(P,O,N,M){if(P.removeEventListener){P.removeEventListener(O,N,!!M);}else{if(P.detachEvent){P.detachEvent("on"+O,N);}}},H=function(){YUI.Env.windowLoaded=true;D.Event._load();E(window,"load",H);},G=function(){D.Event._unload();E(window,"unload",G);},L="domready",J="~yui|2|compat~",I="capture_",F=function(){var O=false,P=0,N=[],Q={},M=null,R={};return{POLL_RETRYS:2000,POLL_INTERVAL:20,lastError:null,_interval:null,_dri:null,DOMReady:false,startInterval:function(){var S=D.Event;if(!S._interval){S._interval=setInterval(D.bind(S._tryPreloadAttach,S),S.POLL_INTERVAL);}},onAvailable:function(Z,V,Y,X,W,T){var S=D.Array(Z),U;for(U=0;U<S.length;U=U+1){N.push({id:S[U],fn:V,obj:Y,override:X,checkReady:W,compat:T});}P=this.POLL_RETRYS;setTimeout(D.bind(D.Event._tryPreloadAttach,D.Event),0);return new D.EventHandle();},onContentReady:function(W,T,V,U,S){return this.onAvailable(W,T,V,U,true,S);},attach:function(Y,Z,T,W){T=T||D.config.win;var X=D.Array(arguments,0,true),c=X.slice(1),d,h=D.Event,f=false,e,V,g,U,b,a,S;if(Y.indexOf(I)>-1){Y=Y.substr(I.length);f=true;}if(c[c.length-1]===J){d=true;c.pop();}if(!Z||!Z.call){return false;}if(this._isValidCollection(T)){e=[];D.each(T,function(j,i){X[2]=j;e.push(h.attach.apply(h,X));});return(e.length===1)?e[0]:e;}else{if(D.Lang.isString(T)){V=(d)?D.DOM.byId(T):D.all(T);if(V&&(V instanceof D.NodeList)&&V.size()>0){g=V.size();if(g>1){X[2]=V;return h.attach.apply(h,X);}else{T=V.item(0);}}else{if(V){T=V;}else{return this.onAvailable(T,function(){h.attach.apply(h,X);},h,true,false,d);}}}}if(!T){return false;}U=D.stamp(T);b="event:"+U+Y;a=Q[b];if(!a){a=D.publish(b,{silent:true,bubbles:false});a.el=T;a.type=Y;a.fn=function(i){a.fire(h.getEvent(i,T,d));};if(T==D.config.win&&Y=="load"){a.fireOnce=true;M=b;if(YUI.Env.windowLoaded){a.fire();}}Q[b]=a;R[U]=R[U]||{};R[U][b]=a;K(T,Y,a.fn,f);}S=c[2]||((d)?T:D.get(T));c[1]=S;c.splice(2,1);return a.subscribe.apply(a,c);},detach:function(Z,b,U,V){var Y=D.Array(arguments,0,true),c,W,X,a,S,T;if(Y[Y.length-1]===J){c=true;}if(Z&&Z.detach){return Z.detach();}if(typeof U=="string"){U=(c)?D.DOM.byId(U):D.all(U);}else{if(this._isValidCollection(U)){a=true;for(W=0,X=U.length;W<X;++W){Y[2]=U[W];a=(D.Event.detach.apply(D.Event,Y)&&a);}return a;}}if(!b||!b.call){return this.purgeElement(U,false,Z);}S="event:"+D.stamp(U)+Z;T=Q[S];if(T){return T.detach(b);}else{return false;}},getEvent:function(V,T,S){var U=V||window.event;return(S)?U:new D.DOMEventFacade(U,T,Q["event:"+D.stamp(T)+V.type]);},generateId:function(S){var T=S.id;if(!T){T=D.stamp(S);S.id=T;}return T;},_isValidCollection:function(T){try{return(T&&typeof T!=="string"&&(T.length&&((!T.size)||(T.size()>1)))&&!T.tagName&&!T.alert&&(T.item||typeof T[0]!=="undefined"));}catch(S){return false;}},_load:function(S){if(!O){O=true;if(D.fire){D.fire(L);}D.Event._tryPreloadAttach();}},_tryPreloadAttach:function(){if(this.locked){return;}if(D.UA.ie&&!YUI.Env.DOMReady){this.startInterval();return;}this.locked=true;var X=!O,W,Y,T,S,V,U;if(!X){X=(P>0);}W=[];Y=function(b,c){var a,Z=c.override;if(c.compat){if(c.override){if(Z===true){a=c.obj;}else{a=Z;}}else{a=b;}c.fn.call(a,c.obj);}else{a=c.obj||D.get(b);c.fn.apply(a,(D.Lang.isArray(Z))?Z:[]);}};for(T=0,S=N.length;T<S;++T){V=N[T];if(V&&!V.checkReady){U=(V.compat)?D.DOM.byId(V.id):D.get(V.id);
if(U){Y(U,V);N[T]=null;}else{W.push(V);}}}for(T=0,S=N.length;T<S;++T){V=N[T];if(V&&V.checkReady){U=(V.compat)?D.DOM.byId(V.id):D.get(V.id);if(U){if(O||(U.get&&U.get("nextSibling"))||U.nextSibling){Y(U,V);N[T]=null;}}else{W.push(V);}}}P=(W.length===0)?0:P-1;if(X){this.startInterval();}else{clearInterval(this._interval);this._interval=null;}this.locked=false;return;},purgeElement:function(X,Y,W){var U=(D.Lang.isString(X))?D.get(X):X,T=this.getListeners(U,W),V,S;if(T){for(V=0,S=T.length;V<S;++V){T[V].detachAll();}}if(Y&&U&&U.childNodes){for(V=0,S=U.childNodes.length;V<S;++V){this.purgeElement(U.childNodes[V],Y,W);}}},getListeners:function(W,V){var X=D.stamp(W,true),S=R[X],U=[],T=(V)?"event:"+X+V:null;if(!S){return null;}if(T){if(S[T]){U.push(S[T]);}}else{D.each(S,function(Z,Y){U.push(Z);});}return(U.length)?U:null;},_unload:function(T){var S=D.Event;D.each(Q,function(V,U){V.detachAll();E(V.el,V.type,V.fn);delete Q[U];});E(window,"load",S._load);E(window,"unload",S._unload);},nativeAdd:K,nativeRemove:E};}();K(window,"load",H);K(window,"unload",G);D.Event=F;if(D.UA.ie&&D.on){D.on(L,F._tryPreloadAttach,F,true);}F.Custom=D.CustomEvent;F.Subscriber=D.Subscriber;F.Target=D.EventTarget;F.Handle=D.EventHandle;F.Facade=D.EventFacade;F._tryPreloadAttach();})();D.Env.evt.plugins.available={on:function(G,F,I,H){var E=arguments.length>4?D.Array(arguments,4,true):[];return D.Event.onAvailable.call(D.Event,I,F,H,E);}};D.Env.evt.plugins.contentready={on:function(G,F,I,H){var E=arguments.length>4?D.Array(arguments,4,true):[];return D.Event.onContentReady.call(D.Event,I,F,H,E);}};(function(){var F=D.UA.ie?"focusin":"focus",G=D.UA.ie?"focusout":"blur",H="capture_",E=D.Env.evt.plugins;E.focus={on:function(){var I=D.Array(arguments,0,true);I[0]=H+F;return D.Event.attach.apply(D.Event,I);},detach:function(){var I=D.Array(arguments,0,true);I[0]=H+F;return D.Event.detach.apply(D.Event,I);}};E.blur={on:function(){var I=D.Array(arguments,0,true);I[0]=H+G;return D.Event.attach.apply(D.Event,I);},detach:function(){var I=D.Array(arguments,0,true);I[0]=H+G;return D.Event.detach.apply(D.Event,I);}};})();D.Env.evt.plugins.key={on:function(H,J,E,N,F){var L=D.Array(arguments,0,true),I,M,K,G;if(!N||N.indexOf(":")==-1){L[0]="keypress";return D.on.apply(D,L);}I=N.split(":");M=I[0];K=(I[1])?I[1].split(/,|\+/):null;G=(D.Lang.isString(E)?E:D.stamp(E))+N;G=G.replace(/,/g,"_");if(!D.getEvent(G)){D.on(H+M,function(S){var T=false,P=false,Q,O,R;for(Q=0;Q<K.length;Q=Q+1){O=K[Q];R=parseInt(O,10);if(D.Lang.isNumber(R)){if(S.charCode===R){T=true;}else{P=true;}}else{if(T||!P){T=(S[O+"Key"]);P=!T;}}}if(T){D.fire(G,S);}},E);}L.splice(2,2);L[0]=G;return D.on.apply(D,L);}};(function(){var E={},F=function(L,K){var J=K.target,M,G,I=E[L],H;for(G in I){if(I.hasOwnProperty(G)){M=false;H=I[G];K.currentTarget.queryAll(G).each(function(O,N){if((!M)&&(O.compareTo(J)||O.contains(J))){K.target=O;D.fire(H,K);}});}}};D.Env.evt.plugins.delegate={on:function(M,L,K,G,I,N){var J="delegate:"+(D.Lang.isString(K)?K:D.stamp(K))+G+I,H=D.Array(arguments,0,true);if(!(G in E)){E[G]={};D.on(G,function(O){F(G,O);},K);}E[G][I]=J;H[0]=J;H.splice(2,3);return D.on.apply(D,H);}};})();(function(){var F,E,H="window:resize",G=function(I){if(D.UA.gecko){D.fire(H,I);}else{if(E){E.cancel();}E=D.later(D.config.windowResizeDelay||40,D,function(){D.fire(H,I);});}};D.Env.evt.plugins.windowresize={on:function(K,J){if(!F){F=D.on("resize",G);}var I=D.Array(arguments,0,true);I[0]=H;return D.on.apply(D,I);}};})();var B=function(H,E,G,J,F){var I=false;if(!H.compareTo(E)&&!H.contains(E)){if(F&&!H.compareTo(J.currentTarget)){J.target=H;}D.fire(G,J);I=true;}return I;};var C=function(J,G,F){var E=J.relatedTarget,I=J.target,H=false;if(F){this.queryAll(F).each(function(K){if((!H)&&(K.compareTo(I)||K.contains(I))){H=B(K,E,G,J,F);}});}else{B(this,E,G,J);}};var A={on:function(L,K,J,H){var G=(L==="mouseenter")?"mouseover":"mouseout",I=L+":"+(D.Lang.isString(J)?J:D.stamp(J))+G+H,F=D.Array(arguments,0,true),E=D.Lang.isString(H)?H:null;if(!D.getEvent(I)){D.on(G,D.rbind(C,D.Node.get(J),I,E),J);}F[0]=I;if(E){F.splice(2,2);}else{F.splice(2,1);}return D.on.apply(D,F);}};D.Env.evt.plugins.mouseenter=A;D.Env.evt.plugins.mouseleave=A;},"@VERSION@",{requires:["event-custom"]});