const mammoth = require('mammoth');

const files = [
  '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Aysel Zeren .docx',
  '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Ayşe Şahin .docx',
  '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Gülsüm Özdemir .docx',
  '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Melek Abdullah .docx',
  '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Seda Kuruca .docx'
];

(async () => {
  for (const f of files) {
    const result = await mammoth.extractRawText({ path: f });
    const fname = f.split('/').pop();
    const text = result.value;
    
    console.log('\n' + '═'.repeat(70));
    console.log('📄 ' + fname);
    console.log('═'.repeat(70));
    console.log('Total chars:', text.length);
    
    const hasPatientInfo = text.includes('Hastanın Adı') || text.includes('D.T');
    const hasComplaint = text.includes('Şikâyeti');
    const hasExam = text.includes('Muayene Bulgusu');
    const hasUSG = text.includes('USG');
    const hasRecipe = text.includes('Reçete') || text.includes('verildi');
    
    console.log('✓ Patient info:', hasPatientInfo ? '✅' : '❌');
    console.log('✓ Complaint:', hasComplaint ? '✅' : '❌');
    console.log('✓ Exam findings:', hasExam ? '✅' : '❌');
    console.log('✓ USG:', hasUSG ? '✅' : '❌');
    console.log('✓ Recipe/meds:', hasRecipe ? '✅' : '❌');
    
    console.log('\n📝 İlk 600 karakter:');
    console.log(text.substring(0, 600));
  }
})();
