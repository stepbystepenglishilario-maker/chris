const form=document.querySelector("#chat-form");
const input=document.querySelector("#message-input");
const messages=document.querySelector("#messages");
const welcome=document.querySelector("#welcome");
const sendButton=document.querySelector("#send-button");
const counter=document.querySelector("#char-count");
const recentList=document.querySelector("#recent-list");
const toast=document.querySelector("#toast");
const mobileMenu=document.querySelector("#mobile-menu");
const sidebar=document.querySelector("#sidebar");
let history=[];
let busy=false;

function toastMessage(text){toast.textContent=text;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),3000)}
function escapeHtml(value){return value.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderMarkdown(text){
  let safe=escapeHtml(text.trim());
  safe=safe.replace(/```([\s\S]*?)```/g,"<pre><code>$1</code></pre>").replace(/`([^`]+)`/g,"<code>$1</code>");
  safe=safe.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
  const lines=safe.split("\n");let html="",listType=null;
  for(const line of lines){const ul=line.match(/^\s*[-*] (.+)$/),ol=line.match(/^\s*\d+[.)] (.+)$/);const next=ul?"ul":ol?"ol":null;
    if(next!==listType){if(listType)html+=`</${listType}>`;if(next)html+=`<${next}>`;listType=next}
    if(next)html+=`<li>${ul?ul[1]:ol[1]}</li>`;else if(line.startsWith("<h3>"))html+=line;else if(line.trim())html+=`<p>${line}</p>`;
  }
  if(listType)html+=`</${listType}>`;return html;
}
function addMessage(role,text){
  const row=document.createElement("div");row.className=`message-row ${role}`;
  if(role==="assistant"){const icon=document.createElement("div");icon.className="message-avatar";icon.textContent="✳";row.append(icon)}
  const content=document.createElement("div");content.className="message-content";content.innerHTML=role==="assistant"?renderMarkdown(text):`<p>${escapeHtml(text).replace(/\n/g,"<br>")}</p>`;row.append(content);messages.append(row);scrollToBottom();return row;
}
function scrollToBottom(){const container=document.querySelector("#conversation");container.scrollTop=container.scrollHeight}
function saveRecent(label){const recent=JSON.parse(localStorage.getItem("chris-recent")||"[]");if(!recent.includes(label))recent.unshift(label);const trimmed=recent.slice(0,6);localStorage.setItem("chris-recent",JSON.stringify(trimmed));renderRecent()}
function renderRecent(){const recent=JSON.parse(localStorage.getItem("chris-recent")||"[]");recentList.innerHTML=recent.length?recent.map(x=>`<button class="recent-item" title="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join(""):'<div class="recent-empty">Tus conversaciones nuevas aparecerán aquí.</div>'}
function typingIndicator(){const row=document.createElement("div");row.className="message-row assistant";row.id="typing";row.innerHTML='<div class="message-avatar">✳</div><div class="message-content"><div class="typing"><i></i><i></i><i></i></div></div>';messages.append(row);scrollToBottom();return row}
async function ask(text){
  const prompt=text.trim();if(!prompt||busy)return;
  welcome.hidden=true;addMessage("user",prompt);saveRecent(prompt.slice(0,42));input.value="";resizeInput();busy=true;sendButton.disabled=true;const typing=typingIndicator();
  try{
    const apiBase=(window.CHRIS_API_BASE_URL||"").replace(/\/$/,"");
    if(!apiBase)throw new Error("La página está lista, pero el chat con IA se activará cuando conectemos un servidor seguro.");
    const response=await fetch(`${apiBase}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:prompt,history:history.slice(-12)})});
    const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||`Error ${response.status}`);
    const reply=data.reply||"No pude generar una respuesta. Intenta preguntarlo de otra manera.";history.push({role:"user",content:prompt},{role:"assistant",content:reply});typing.remove();addMessage("assistant",reply);
  }catch(error){typing.remove();const row=addMessage("assistant",error.message==="Failed to fetch"?"No encuentro el servicio de IA. Si estás probando la app localmente, inicia el servidor con `npm run dev` y configura `OPENAI_API_KEY`.":`No pude completar la respuesta: ${error.message}`);row.classList.add("error-message")}
  finally{busy=false;sendButton.disabled=false;input.focus()}
}
function resizeInput(){input.style.height="auto";input.style.height=`${Math.min(input.scrollHeight,180)}px`;counter.textContent=`${input.value.length} / 8000`}
form.addEventListener("submit",event=>{event.preventDefault();ask(input.value)});
input.addEventListener("input",resizeInput);
document.querySelectorAll(".suggestion").forEach(button=>button.addEventListener("click",()=>{input.value=button.dataset.prompt;resizeInput();input.focus()}));
document.querySelector("#new-chat").addEventListener("click",()=>{history=[];messages.replaceChildren();welcome.hidden=false;input.value="";resizeInput();sidebar.classList.remove("open");input.focus()});
mobileMenu.addEventListener("click",()=>sidebar.classList.toggle("open"));
document.addEventListener("keydown",event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();document.querySelector("#new-chat").click()}if(event.key==="Escape")sidebar.classList.remove("open")});
document.addEventListener("click",event=>{if(sidebar.classList.contains("open")&&!sidebar.contains(event.target)&&!mobileMenu.contains(event.target))sidebar.classList.remove("open")});
renderRecent();resizeInput();
