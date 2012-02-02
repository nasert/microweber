
(function(){var each=tinymce.each;tinymce.create('tinymce.plugins.PastePlugin',{init:function(ed,url){var t=this,cb;t.editor=ed;t.url=url;t.onPreProcess=new tinymce.util.Dispatcher(t);t.onPostProcess=new tinymce.util.Dispatcher(t);t.onPreProcess.add(t._preProcess);t.onPostProcess.add(t._postProcess);t.onPreProcess.add(function(pl,o){ed.execCallback('paste_preprocess',pl,o);});t.onPostProcess.add(function(pl,o){ed.execCallback('paste_postprocess',pl,o);});function process(o){var dom=ed.dom;t.onPreProcess.dispatch(t,o);o.node=dom.create('div',0,o.content);t.onPostProcess.dispatch(t,o);o.content=ed.serializer.serialize(o.node,{getInner:1});if(/<(p|h[1-6]|ul|ol)/.test(o.content))
t._insertBlockContent(ed,dom,o.content);else
t._insert(o.content);};ed.addCommand('mceInsertClipboardContent',function(u,o){process(o);});function grabContent(e){var n,or,rng,sel=ed.selection,dom=ed.dom,body=ed.getBody(),posY;if(dom.get('_mcePaste'))
return;n=dom.add(body,'div',{id:'_mcePaste'},'&nbsp;');if(body!=ed.getDoc().body)
posY=dom.getPos(ed.selection.getStart(),body).y;else
posY=body.scrollTop;dom.setStyles(n,{position:'absolute',left:-10000,top:posY,width:1,height:1,overflow:'hidden'});if(tinymce.isIE){rng=dom.doc.body.createTextRange();rng.moveToElementText(n);rng.execCommand('Paste');dom.remove(n);if(n.innerHTML==='&nbsp;')
return;process({content:n.innerHTML});return tinymce.dom.Event.cancel(e);}else{or=ed.selection.getRng();n=n.firstChild;rng=ed.getDoc().createRange();rng.setStart(n,0);rng.setEnd(n,1);sel.setRng(rng);window.setTimeout(function(){var h='';each(dom.select('div[id=_mcePaste]').reverse(),function(n){h+=(dom.select('> span.Apple-style-span div',n)[0]||dom.select('> span.Apple-style-span',n)[0]||n).innerHTML;dom.remove(n);});if(or)
sel.setRng(or);process({content:h});},0);}};if(ed.getParam('paste_auto_cleanup_on_paste',true)){if(tinymce.isOpera||/Firefox\/2/.test(navigator.userAgent)){ed.onKeyDown.add(function(ed,e){if(((tinymce.isMac?e.metaKey:e.ctrlKey)&&e.keyCode==86)||(e.shiftKey&&e.keyCode==45))
grabContent(e);});}else{ed.onPaste.addToTop(function(ed,e){return grabContent(e);});}}
if(ed.getParam('paste_block_drop')){ed.onInit.add(function(){ed.dom.bind(ed.getBody(),['dragend','dragover','draggesture','dragdrop','drop','drag'],function(e){e.preventDefault();e.stopPropagation();return false;});});}
t._legacySupport();},getInfo:function(){return{longname:'Paste text/word',author:'Moxiecode Systems AB',authorurl:'http://tinymce.moxiecode.com',infourl:'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/paste',version:tinymce.majorVersion+"."+tinymce.minorVersion};},_preProcess:function(pl,o){var ed=this.editor,h=o.content,process,stripClass;function process(items){each(items,function(v){if(v.constructor==RegExp)
h=h.replace(v,'');else
h=h.replace(v[0],v[1]);});};if(/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/.test(h)||o.wordContent){o.wordContent=true;process([/^\s*(&nbsp;)+/g,/(&nbsp;|<br[^>]*>)+\s*$/g]);if(ed.getParam('paste_convert_middot_lists',true)){process([[/<!--\[if !supportLists\]-->/gi,'$&__MCE_ITEM__'],[/(<span[^>]+:\s*symbol[^>]+>)/gi,'$1__MCE_ITEM__'],[/(<span[^>]+mso-list:[^>]+>)/gi,'$1__MCE_ITEM__']]);}
process([/<!--[\s\S]+?-->/gi,/<\/?(img|font|meta|link|style|div|v:\w+)[^>]*>/gi,/<\\?\?xml[^>]*>/gi,/<\/?o:[^>]*>/gi,/ (id|name|language|type|on\w+|v:\w+)=\"([^\"]*)\"/gi,/ (id|name|language|type|on\w+|v:\w+)=(\w+)/gi,[/<(\/?)s>/gi,'<$1strike>'],/<script[^>]+>[\s\S]*?<\/script>/gi,[/&nbsp;/g,'\u00a0']]);if(!ed.getParam('paste_retain_style_properties')){process([/<\/?(span)[^>]*>/gi]);}}
stripClass=ed.getParam('paste_strip_class_attributes','all');if(stripClass!='none'){if(stripClass=='all'){process([/ class=\"([^\"]*)\"/gi,/ class=(\w+)/gi]);}else{process([/ class=\"(mso[^\"]*)\"/gi,/ class=(mso\w+)/gi]);}}
if(ed.getParam('paste_remove_spans')){process([/<\/?(span)[^>]*>/gi]);}
o.content=h;},_postProcess:function(pl,o){var t=this,ed=t.editor,dom=ed.dom,styleProps;if(o.wordContent){each(dom.select('a',o.node),function(a){if(!a.href||a.href.indexOf('#_Toc')!=-1)
dom.remove(a,1);});if(t.editor.getParam('paste_convert_middot_lists',true))
t._convertLists(pl,o);styleProps=ed.getParam('paste_retain_style_properties');if(tinymce.is(styleProps,'string'))
styleProps=tinymce.explode(styleProps);each(dom.select('*',o.node),function(el){var newStyle={},npc=0,i,sp,sv;if(styleProps){for(i=0;i<styleProps.length;i++){sp=styleProps[i];sv=dom.getStyle(el,sp);if(sv){newStyle[sp]=sv;npc++;}}}
dom.setAttrib(el,'style','');if(styleProps&&npc>0)
dom.setStyles(el,newStyle);else
if(el.nodeName=='SPAN'&&!el.className)
dom.remove(el,true);});}
if(ed.getParam("paste_remove_styles")||(ed.getParam("paste_remove_styles_if_webkit")&&tinymce.isWebKit)){each(dom.select('*[style]',o.node),function(el){el.removeAttribute('style');el.removeAttribute('mce_style');});}else{if(tinymce.isWebKit){each(dom.select('*',o.node),function(el){el.removeAttribute('mce_style');});}}},_convertLists:function(pl,o){var dom=pl.editor.dom,listElm,li,lastMargin=-1,margin,levels=[],lastType,html;each(dom.select('p',o.node),function(p){var sib,val='',type,html,idx,parents;for(sib=p.firstChild;sib&&sib.nodeType==3;sib=sib.nextSibling)
val+=sib.nodeValue;val=p.innerHTML.replace(/<\/?\w+[^>]*>/gi,'').replace(/&nbsp;/g,'\u00a0');if(/^(__MCE_ITEM__)+[\u2022\u00b7\u00a7\u00d8o]\s*\u00a0*/.test(val))
type='ul';if(/^__MCE_ITEM__\s*\w+\.\s*\u00a0{2,}/.test(val))
type='ol';if(type){margin=parseFloat(p.style.marginLeft||0);if(margin>lastMargin)
levels.push(margin);if(!listElm||type!=lastType){listElm=dom.create(type);dom.insertAfter(listElm,p);}else{if(margin>lastMargin){listElm=li.appendChild(dom.create(type));}else if(margin<lastMargin){idx=tinymce.inArray(levels,margin);parents=dom.getParents(listElm.parentNode,type);listElm=parents[parents.length-1-idx]||listElm;}}
each(dom.select('span',p),function(span){var html=span.innerHTML.replace(/<\/?\w+[^>]*>/gi,'');if(type=='ul'&&/^[\u2022\u00b7\u00a7\u00d8o]/.test(html))
dom.remove(span);else if(/^[\s\S]*\w+\.(&nbsp;|\u00a0)*\s*/.test(html))
dom.remove(span);});html=p.innerHTML;if(type=='ul')
html=p.innerHTML.replace(/__MCE_ITEM__/g,'').replace(/^[\u2022\u00b7\u00a7\u00d8o]\s*(&nbsp;|\u00a0)+\s*/,'');else
html=p.innerHTML.replace(/__MCE_ITEM__/g,'').replace(/^\s*\w+\.(&nbsp;|\u00a0)+\s*/,'');li=listElm.appendChild(dom.create('li',0,html));dom.remove(p);lastMargin=margin;lastType=type;}else
listElm=lastMargin=0;});html=o.node.innerHTML;if(html.indexOf('__MCE_ITEM__')!=-1)
o.node.innerHTML=html.replace(/__MCE_ITEM__/g,'');},_insertBlockContent:function(ed,dom,content){var parentBlock,marker,sel=ed.selection,last,elm,vp,y,elmHeight;function select(n){var r;if(tinymce.isIE){r=ed.getDoc().body.createTextRange();r.moveToElementText(n);r.collapse(false);r.select();}else{sel.select(n,1);sel.collapse(false);}};this._insert('<span id="_marker">&nbsp;</span>',1);marker=dom.get('_marker');parentBlock=dom.getParent(marker,'p,h1,h2,h3,h4,h5,h6,ul,ol,th,td');if(parentBlock&&!/TD|TH/.test(parentBlock.nodeName)){marker=dom.split(parentBlock,marker);each(dom.create('div',0,content).childNodes,function(n){last=marker.parentNode.insertBefore(n.cloneNode(true),marker);});select(last);}else{dom.setOuterHTML(marker,content);sel.select(ed.getBody(),1);sel.collapse(0);}
dom.remove('_marker');elm=sel.getStart();vp=dom.getViewPort(ed.getWin());y=ed.dom.getPos(elm).y;elmHeight=elm.clientHeight;if(y<vp.y||y+elmHeight>vp.y+vp.h)
ed.getDoc().body.scrollTop=y<vp.y?y:y-vp.h+25;},_insert:function(h,skip_undo){var ed=this.editor;if(!ed.selection.isCollapsed())
ed.getDoc().execCommand('Delete',false,null);ed.execCommand(tinymce.isGecko?'insertHTML':'mceInsertContent',false,h,{skip_undo:skip_undo});},_legacySupport:function(){var t=this,ed=t.editor;each(['mcePasteText','mcePasteWord'],function(cmd){ed.addCommand(cmd,function(){ed.windowManager.open({file:t.url+(cmd=='mcePasteText'?'/pastetext.htm':'/pasteword.htm'),width:parseInt(ed.getParam("paste_dialog_width","450")),height:parseInt(ed.getParam("paste_dialog_height","400")),inline:1});});});ed.addButton('pastetext',{title:'paste.paste_text_desc',cmd:'mcePasteText'});ed.addButton('pasteword',{title:'paste.paste_word_desc',cmd:'mcePasteWord'});ed.addButton('selectall',{title:'paste.selectall_desc',cmd:'selectall'});}});tinymce.PluginManager.add('paste',tinymce.plugins.PastePlugin);})();