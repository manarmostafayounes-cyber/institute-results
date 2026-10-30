 



const SCRIPT_URL ="https://script.google.com/macros/s/AKfycbxKzK8TDMEJMHIwOJXKiijl2jN4LtOR3AHAyZS6cujPmAUYMczyUfBsT8ZORKjoq7tt/exec";


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
    let errorMsg = document.getElementById("errorMsg");

    // 1. التاكد ان الخانتين مش فاضين

    if (nameInput === "" || rollInput === "") {
        showError("يرجى ادخال اسم الطالب ورقم الجلوس معا!")
        return;
    }
       let searchBtn = document.getElementById("searchcard").querySelector("button");
       if (searchBtn) {
          searchBtn.disabled = true;
          searchBtn.innerHTML ='<span class="spinner"></span> جاري البحث...';

       }



    try {  
    // 2. جلب البيانات ديناميكبا من جوجل شيت 
     let cleanRoll = rollInput.replace(/[\u0660-\u0660]/g, d => d.charCodeAt(0) - 0x0660);
     let response = await fetch(`${SCRIPT_URL}?query=${encodeURIComponent(cleanRoll)}&_t=${Date.now()}`); 
     let student = await response.json();

     //التاكد ان النتيجه موجوده و مفيش خطأ 
if ( student && !student.error) {
   
   if (student.paymentStatus === "غير مدفوع " || student.paymentStatus === "unpaid") {
      swal.fire({
         icon: 'error',
         title: 'عذراً لا يمكن عرض النتيجه ',
         text: 'يجب دفع الرسوم الدراسية اولا!',
         confirmButtonColor:  '#d33',
         confirmButtonText: 'حسنا',
   }).then((result) => {
      if (result.isConfirmed) {
         resetSearch();
      }
   });
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
    searchBtn.innerHTML = "عرض النتيجه ";
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
       let element = document.querySelector(".student-card");

       let opt = {
        margin: 10,
        filename:      'Student_Result.pdf',
        image:         { type: 'jpeg', quality: 0.98 },
        html2canvas:   { scale: 2, useCORS: true, scrollY: 0},
        jsPDF:         { unit: 'mm', format: 'a4', orientation: 'portrait'}
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



window.addEventListener("DOMContentLoaded",() => {
      resetSearch();
});
   
   
   




//وظائف النوافذ المنبثقة

function openModal(id) {
   document.getElementById(id).classList.add('active');

}

function closeModal(id) {
   document.getElementById(id).classList.remove('active');
}

function closeModalOnBg(event, id) {
   if (event.target.classList.contains('portal-modal-overlay')) {
      closeModal(id);
   }
}







document.addEventListener("DOMContentLoaded", function() {

 window. showPetitionForm = function() {
      let searchNameInput = document.getElementById('studentName');
      let searchRollInput = document.getElementById('rollNumber');


      let petitionNameField = document.getElementById('petStudentName');
      let petitionSeatField = document.getElementById('petSeatNo') ;

      if (petitionNameField && searchNameInput) {
         petitionNameField.value = searchNameInput.value;
      }
      if (petitionSeatField && searchRollInput) {
         petitionSeatField.value = searchRollInput.value;
      }

      //تعبئه قائمه المواد تلقائيه من مصفوفه subjectNames
      let subjectSelect = document.getElementById('petitionSubject');
      if (subjectSelect && typeof subjectNames !== 'undefined') {
         subjectSelect.innerHTML = '<option value="" disabled selected>اختر الماده</option>'; // Clear existing options
         subjectNames.forEach(function(subject) {
            let option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
         });
      }               

   let petitionCard = document.getElementById('petitionCard');
   if (petitionCard) {
      petitionCard.style.display = 'block';
      petitionCard.scrollIntoView({ behavior: 'smooth' });
   }

 };

   window.closePetition = function() {
      let petitionCard = document.getElementById('petitionCard');
      if (petitionCard) {
         petitionCard.style.display = 'none';
      }

};



const petitionForm = document.getElementById('petitionForm');
   if (petitionForm) {
      petitionForm.addEventListener('submit', function(event) {
         event.preventDefault();

         let studentName = document.getElementById('petStudentName').value;
         let subject = document.getElementById('petitionSubject').value;
         let receiptNo = document.getElementById('receiptNumber').value;

   if (!subject) {
      Swal.fire({
         icon: 'warning',
         title: 'تنبيه',
         text: 'يرجى اختيار الماده المراد عمل التماس لها !',
         confirmButtonColor:'#00bcd4'
      });
      return;
   }
   //داله اظهار رسالهالنجاح 
   swal.fire({
      icon: 'success',
      title: 'تم ارسال الالتماس بنجاح',
      html: `عزيزي الطالب <b>${studentName}</b><br>تم تسجيل طلب الالتماس لمادة <b>${subject}</b> رقم الايصال <b>${receiptNo}</b>.<br> جاري مراجعه الطلب من قبل الكنترول .`,
      confirmButtonColor:'#00bcd4'
   }).then((result) => {
      if (result.isConfirmed) {
         //اغلاق نافزه الالتماس وفك الكارد 
         let petitionCard = document.getElementById('petitionCard');
         if (petitionCard) {
            petitionCard.style.display = 'none';
         }

         petitionForm.reset();

      let fileText = document.getElementById('fileLabelText');
      if (fileText) {
         fileText.textContent = "اختر صورة ايصال الخزنة ";
         fileText.style.color = "#555";
      }
      }
   });
});
   }
});


window.updateFileName = function(input) {
   let fileNameDisplay = document.getElementById('fileNameDisplay');
   if (input.files && input.files[0]) {
      fileNameDisplay.textContent = "تم اختيار : " + input.files[0].name;
      fileNameDisplay.style.color = "#00bcda";
   } else {
      fileNameDisplay.textContent = "اختر صورة ايصال الخزنة ";
      fileNameDisplay.style.color = "#555";
   }  
};       







