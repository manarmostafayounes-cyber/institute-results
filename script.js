 



const SCRIPT_URL ="https://script.google.com/macros/s/AKfycbwAIWmIQ-TLNgJifNKN_4TTSSai6_lM-gMwRfJitVzVKcjaJEjvfMT4tcIISrHOs1st/exec";


const subjectNames = [

      ,"اقتصاد خدمات عامة"
      ,"مبادئ استثمار"
      ,"تصميم برامج حاسب الالي"
      ,"قواعد البيانات "
      ,"مبادئ اقتصاد كلى"
      ,"البنيه التحتية التكنولوجيا المعلومات"
      ,"تحليل و تصميم نظم معلومات"
      ,"ادارة الموارد البشريه"
      ,"الاقتصاد الدولي"
      ,"محاسبه في الوحدات الحكوميه"
      ,"ريادة الاعمال و المشروعات" 






]


async function searchResult() {

    let nameInput = document.getElementById("studentName").value.trim();
    let rollInput = document.getElementById("rollNumber").value.trim();    
    let searchcard = document.getElementById("searchcard");
    let resultcard = document.getElementById("resultcard");
    let errorMsg = document.getElementById("errorMag");

    // 1. التاكد ان الخانتين مش فاضين

    if (nameInput === "" || rollInput === "") {
        showError("يرجى ادخال اسم الطالب ورقم الجلوس معا!")
        return;
    }
       let searchBtn = document.getElementById("searchcard").querySelector("button");
       if (searchBtn) {
          searchBtn.disabled = true;
          searchBtn.innerText = "جاري البحث ";

       }



    try {  
    // 2. جلب البيانات ديناميكبا من جوجل شيت 
     let cleanRoll = rollInput.replace(/[\u0660-\u0660]/g, d => d.charCodeAt(0) - 0x0660);
     let response = await fetch(`${SCRIPT_URL}?query=${encodeURIComponent(cleanRoll)}`); 
     let student = await response.json();

     //التاكد ان النتيجه موجوده و مفيش خطأ 
     if ( student && !student.error) {
         let cleanInput = normalizeText(nameInput);
         let cleanStudentName = normalizeText(student.studentName);

         let inputWords =  cleanInput.split(" ").filter(word => word.length > 0);
         let isMatch = inputWords.every(word => cleanStudentName.includes(word));



        //التاكد من ان الاسم المكتوب يطابق الاسم المسجل في جوجل شيت 
        if (!isMatch){
           showError("اسم الطالب غير مطابق لرقم الجلوس المدخل!");
         return;
        }
           //4.عرض البيانات في الواجهه
           document.getElementById("studentDetails").innerHTML=`
           <b>اسم الطالب :</b> ${student.studentName}<br>
           <b>رقم الجلوس:</b> ${student.rollNumber}<br>
           <b>حاله الطالب:</b> ${student.status || "مستجد"}

           `;

           //بناء جدول الدرجات للمواد المتاحه
          let tableHTML =""; 
             if (student.grades) {     
             for (let i = 1; i<= 11; i++) {
                let subKey = "sub" + i;
                let gradeValue = student.grades[subKey];
                if (gradeValue !== undefined && gradeValue !== ""){
                    let actualName = subjectNames[i] || ` ماده${i}`;
                    tableHTML +=`
                           <tr>
                              <td> ${actualName}</td>
                              <td> ${gradeValue}</td>
                            </tr> 

                    `;

                }
             };
        }
          document.getElementById("gradesTableBody").innerHTML = tableHTML;

          //عرض المعدل و الساعات 
          document.getElementById("gpaBox").innerHTML = `
          <span> المعدل(GPA): ${ student.gpa || "-"}</span> |
          <span>الساعات: ${student.creditHours || "-"}</span>
          `;

          //اخفاء رساله الخطأ و كارت البحث و اظهار كارت النتيجه 
          if (errorMsg) errorMsg.classList.add("hidden");
          if (searchcard) searchcard.classList.add("hidden");
          if (resultcard) resultcard.classList.remove("hidden")
        
        
        
        } else {
            showError('رقم الجلوس غير موجود!')
        }


} catch (error) {
   console.error("تفاصيل الخطا الحقيقي :",error);
    showError(" حدث خطأ اثناء الاتصال بقاعده البيانات!")

} finally {
  if (searchBtn) {
    searchBtn.disabled = false;
    searchBtn.innerHTML = "اظهار النتيجه ";
  }
} 

}

//داله اظهار الخطأ
    
    function showError(msg) {
      Swal.fire({
         icon: 'error',
         title:'تنبيه',
         text: msg,
         confirmButtonText: 'حسنا',
         confirmButtonColor:  '#0056b3',
         customClass:{ popup:'swal-rtl'}
      });
    }

    //داله اعاده البحث 

    function resetSearch() {
       document.getElementById("rollNumber").value = "";
       document.getElementById("studentName").value = "";

       let searchcard = document.getElementById("searchcard");
       let resultcard = document.getElementById("resultcard");
       let errorMsg = document.getElementById("errorMsg");

       if (searchcard) searchcard.classList.remove("hidden");
       if (resultcard) resultcard.classList.add("hidden");
       if (errorMsg) errorMsg.classList.add("hidden");

    }




    function normalizeText(text) {
       if (!text) return "";
       return text
       .toString()
       .trim()
       .toLowerCase()             //تحويل الانجليزي ل small
       .replace(/[\u064b-\u0652]/g, "")
       .replace(/[\u0621\u0622\u0623\u0624\u0625\u0626\u9625]/g, "\u0627")    //تحويل جميع انواع الهمزات الى ا 
       .replace(/\u0649/g, "\u064a")      //تحويل ال ى ال ي (او العكس )
       .replace(/\u0629/g, "\u0647")      //تحويل التاء المربوطة الى ه
       .replace(/-/g, "")
       .replace(/\b\u0627\u0644/g, "")
       .replace(/\u0639\u0628\u062f\s+/g, "\u0639\u0628\u062f")
       .replace(/\s+/g," ");
    }
    



    function downloadPDF() {
       let element = document.getElementById("resultcard");

       let opt = {
        margin: 0.3,
        filename:      'نتيجه -الطالب.pdf',
        image:         { type: 'jpeg', quality: 0.98 },
        html2canvas:   { scale: 2},
        jsPDF:         { unit: 'in', format: 'letter', orientation: 'portrait'}
          
       };
        html2pdf().set(opt).from(element).save();
    }


    window.addEventListener('load', function() {
     setTimeout(function () {
       const splash = document.getElementById('splash-screen');
       if (splash) {
          splash.classList.add('fade-out');
          setTimeout(function() {
            splash.style.display = 'none';
          }, 800);
       }
     }, 3000);
});
   
   
   
   
   
   
   