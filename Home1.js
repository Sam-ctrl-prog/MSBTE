document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

document.getElementById("signup").addEventListener("click", function () {
    window.location.href = "signup.html";
});

document.getElementById("login1").addEventListener("click",function(){
    window.location.href="Admin_login.html";
});
document.getElementById("login2").addEventListener("click",function(){
    window.location.href="Stu_login.html";
});