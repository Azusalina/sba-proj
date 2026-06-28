window.onload=function(){
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