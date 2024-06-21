let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchbtn = document.querySelector("#searchbtn");
let directbtn = document.querySelector("#directbtn");
let trafficbtn = document.querySelector("#trafficbtn");
let searchsidebar = document.querySelector(".search-sidebar");
//let searchsidebar = document.querySelector(".tt-side-panel");
let trafficsidebar = document.querySelector(".traffic-sidebar");
let directsidebar = document.querySelector(".direct-sidebar");



closeBtn.addEventListener("click", ()=>{
  sidebar.classList.toggle("open");
  menuBtnChange();//calling the function(optional)
});

/*.addEventListener("click", ()=>{ // Sidebar open when you click on the search iocn
  sidebar.classList.toggle("open");
  menuBtnChange(); //calling the function(optional)
});*/

/*searchbtn.addEventListener("click", ()=>{
  searchsidebar.classList.toggle("open");
  menuBtnChange();//calling the function(optional)
});

trafficbtn.addEventListener("click", ()=>{
  trafficsidebar.classList.toggle("open");
  menuBtnChange();//calling the function(optional)
});

directbtn.addEventListener("click", ()=>{
  directsidebar.classList.toggle("open");
  menuBtnChange();//calling the function(optional)
});*/
// following are the code to change sidebar button(optional)
function menuBtnChange() {
 if(sidebar.classList.contains("open")){
   closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");//replacing the iocns class
 }else {
   closeBtn.classList.replace("bx-menu-alt-right","bx-menu");//replacing the iocns class
 }
}



trafficbtn.addEventListener("click", ()=>{
  if (directsidebar.classList.contains('open')) {
    directsidebar.classList.remove('open');
    trafficsidebar.classList.toggle("open");
    menuBtnChange();//calling the function(optional)
  }
  else {
    trafficsidebar.classList.toggle("open");
    menuBtnChange();//calling the function(optional)
  }
  
});


directbtn.addEventListener("click", ()=>{
  if (trafficsidebar.classList.contains('open')) {
    trafficsidebar.classList.remove('open');
    directsidebar.classList.toggle("open");
    menuBtnChange();//calling the function(optional)
  }
  else {
    directsidebar.classList.toggle("open");
    menuBtnChange();//calling the function(optional)
  }
  
});