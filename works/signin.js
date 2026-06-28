window.onload=function(){
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

//async returns a promise 
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
}