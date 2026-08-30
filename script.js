 



const SCRIPT_URL ="https://script.google.com/macros/s/AKfycbx3-szJ7j3vaOJg-86_UsUPGNT2yHb0py1_7rmC6z4rusxlaxan4ti1lW-w8NWXLf61/exec";


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

    try {  
    // 2. جلب البيانات ديناميكبا من جوجل شيت 
     let response = await fetch(`${SCRIPT_URL}?query=${encodeURIComponent(rollInput)}`); 
     let student = await response.json();

     //التاكد ان النتيجه موجوده و مفيش خطأ 
     if (!student.error) {
        //التاكد من ان الاسم المكتوب يطابق الاسم المسجل في جوجل شيت 
        if (!normalizeText(student.studentName).includes(normalizeText(nameInput))){
           showError("اسم الطالب غير مطابق لرقم الجلوس المدخل!")
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
    showError(" حدث خطأ اثناء الاتصال بقاعده البيانات!")
} 

}

//داله اظهار الخطأ
    
    function showError(msg) {
        let errorMsg = document.getElementById("errorMsg");
        if (errorMsg) {
          errorMsg.innerHTML = msg;
          errorMsg.classList.remove("hidden");
        }
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
       .replace(/[أا]/g,"ا")    //تحويل جميع انواع الهمزات الى ا 
       .replace(/ى/g, "ي")      //تحويل ال ى ال ي (او العكس )
       .replace(/ة/g, "ه")      //تحويل التاء المربوطة الى ه
       .replace(/-/g, "")
       .replace(/\s+/g," ");
    }
    