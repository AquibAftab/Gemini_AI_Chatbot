const typingForm= document.querySelector(".typing-form");
const chatList= document.querySelector(".chat-list");
const toggleThemeButton= document.querySelector("#toggle-theme-button"); 
const deleteChatButton= document.querySelector("#delete-chat-button"); 

let userMessage=null;

const API_KEY ="AIzaSyAjk3nfi4sC5A0bAkCuwDbAhGTjqp7USKE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let btn = document.querySelector("#toggle-theme-button");


const loadLocalstorageData = () => {
    const isLightMode = (localStorage.getItem("themeColor")==="light_mode");
    document.body.classList.toggle("light_mode",isLightMode);
    
   // document.body.classList.toggle("hide-header",savedChats);
    chatList.scrollTo(0, chatList.scrollHeight);
}

//loadLocalstorageData();

const createMessageElement= (content, ...classes) => {
    const savedChats = localStorage.getItem("savedChats");
    const div= document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML=content;
    return div;
}

// show typing effect one by one

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words= text.split(' ');
    let currentWordIndex=0;

    const typingInterval = setInterval(() => {
        // Apppend each word to the text element with space
        textElement.innerText += (currentWordIndex === 0 ? '':' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        // If all words are displayed
        if(currentWordIndex === words.length){
            clearInterval(typingInterval);
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            //localStorage.setItem("savedChats",chatList.innerHTML);
            chatList.scrollTo(0, chatList.scrollHeight);// scroll to bottom
        }
    },75);
}
// fetch response from the API on user message 

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement= incomingMessageDiv.querySelector(".text"); //Get text element

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{text: userMessage}]
                }]
            })
        });
        const data= await response.json();
        // Get an API response text
        const apiResponse= data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        showTypingEffect(apiResponse, textElement, incomingMessageDiv);
        
    }
    catch(error){
        console.log(error);
        
    }
    finally{
        incomingMessageDiv.classList.remove("loading");
    }
}
const showLoadingAnimation = () => {
    const html =`<div class="message-content">
                <img src="images/gemini.svg" alt="Gemini Image" class="avatar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
        <i class="icon fa-regular fa-copy"></i>`;

    const incomingMessageDiv= createMessageElement(html,"incoming","loading");
    chatList.appendChild(incomingMessageDiv); 
    chatList.scrollTo(0, chatList.scrollHeight);

    generateAPIResponse(incomingMessageDiv);
}
// copy message text to the clipboard
const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText ; // show tick icon
    setTimeout(() => copyIcon.innerText = "content_copy",1000);
}
const handleOutgoingChat= () =>  {
    userMessage=typingForm.querySelector(".typing-input").value.trim();
    if(!userMessage) return;//exit if no msg
    
    const html =`<div class="message-content">
                <img src="images/user.jpg" alt="User Image" class="avatar">
                <p class="text"></p>
            </div> `;

    const outgoingMessageDiv= createMessageElement(html,"outgoing");
    outgoingMessageDiv.querySelector(".text").innerText=userMessage;
    chatList.appendChild(outgoingMessageDiv); 

    typingForm.reset();
    chatList.scrollTo(0, chatList.scrollHeight);
    document.body.classList.add("hide-header");
    setTimeout(showLoadingAnimation,500);
}
toggleThemeButton.addEventListener("click", () => {
    const  isLightMode=document.body.classList.toggle("light_mode");
    // localStorage.setItem("themeColor",isLightMode ? "light_mode" :  "dark_mode");
    });

    deleteChatButton.addEventListener("click", () => {
        if(confirm("Are you sure you want to delete all messages ?")){
            // localStorage.removeItem("savedChats");
            
        }
    });

typingForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    handleOutgoingChat();

});