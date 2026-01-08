// home.js
document.addEventListener('DOMContentLoaded', function() {
    // מוסיף מאזין אירועים שמפעיל את הקוד כאשר ה-DOM נטען במלואו
    console.log('home.js loaded');
    // מדפיס ללוג כדי לאשר שהקובץ נטען

    // בדיקת לחיצות על הכפתורים
    const buttons = document.querySelectorAll('.home-button');
    // מוצא את כל האלמנטים עם המחלקה home-button (הקישורים בדף הבית)
    buttons.forEach(button => {
        // לולאה שרצה על כל הכפתורים
        button.addEventListener('click', function(event) {
            // מוסיף מאזין אירועים ללחיצה על כל כפתור
            console.log('Button clicked:', button.textContent);
            // מדפיס ללוג את הטקסט של הכפתור שנלחץ (למשל, "Single Player")
            console.log('Navigating to:', button.getAttribute('href'));
            // מדפיס ללוג את ה-URL שאליו הכפתור אמור להוביל (למשל, "single-player.html")
            // אין כאן preventDefault כדי לאפשר לקישור לעבוד כרגיל
        });
    });
});