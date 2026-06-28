window.onload=function(){
    const stage=document.getElementById("stage");   
    const to_signin_switch=document.getElementById("to_signin_redirection");
    const to_signup_switch=document.getElementById("to_signup_redirection");
    to_signup_switch.onclick = function() {stage.classList.add('swipe');}
    to_signin_switch.onclick = function() {stage.classList.remove('swipe');}

///////
    const signin_name=document.getElementById("signin_name");
    const signin_pwd=document.getElementById("signin_pwd");
    const singin_btn=document.getElementById("signin_btn");
    const signin_status=document.getElementById("signin_status");

    let username="";
    let pwd="";
    singin_btn.onclick=function(event){
        event.preventDefault();
        username=signin_name.value.trim();
        pwd=signin_pwd.value.trim();
        if(!username || ! pwd){
            signin_status.innerText="Fill in both Name and Password to Continue";
            return;
        }else{
            send();
        }
    }
    async function send(){
        const url='http://127.0.0.1:3000/api/login';
        const data={user_name:username, passwd:pwd};

        try{
            
            const resp=await fetch(url,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(data)
            });

            const result=await resp.json();

            if(result.success){//if value of success in json =true then...
                signin_status.innerText="status:sucess";
                window.location.href="main.html";
            }else{
                signin_status.innerText="status:fail";
            }
        }catch(error){
            signin_status.innerText="Service in Maintenance,try again later";
        }
    }

///////
    const signup_id=document.getElementById("signup_id");
    const signup_email=document.getElementById("signup_email");
    const signup_pwd=document.getElementById("signup_pwd");
    const signup_status=document.getElementById("signup_status");
    const signup_btn=document.getElementById("signup_btn");

    signup_btn.onclick=function(event){
        event.preventDefault();
        const username=signup_id.value.trim();
        const email=signup_email.value.trim();
        const pwd=signup_pwd.value.trim();

        if(!username||!email||!pwd){
            signup_status.innerText="Please fill all missing blanks";
            return;
        }else{
            signup();
        }
        async function signup(){
            const url='http://127.0.0.1:3000/api/signup'
            const data={username:username,email:email,pwd:pwd};
            try{
                const resp=await fetch(url,{
                    method:'POST',
                    headers:{"Content-type":"application/json"},
                    body:JSON.stringify(data)
                })
                const result=await resp.json();
                if(result.success){
                    signup_status.innerText="success";
                }else{
                    signup_status.innerText="fatal error";
                }
            }catch(error){
                signup_status.innerText="Service in Maintenance,try again later";
            }
        }


    }

}

