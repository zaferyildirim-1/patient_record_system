const mammoth = require('mammoth');
const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const testFiles = [
	{ name: 'Aysel Zeren', path: '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Aysel Zeren .docx' },
	{ name: 'Ayşe Şahin', path: '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Ayşe Şahin .docx' },
	{ name: 'Gülsüm Özdemir', path: '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Gülsüm Özdemir .docx' },
	{ name: 'Melek Abdullah', path: '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Melek Abdullah .docx' },
	{ name: 'Seda Kuruca', path: '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Seda Kuruca .docx' }
];

function buildPrompt(text) {
	return `Sen deneyimli bir Kadın Hastalıkları ve Doğum uzmanı ve tıbbi dokümantasyon uzmanısın.
Görevin: Verilen Türkçe hasta muayene metnini yapısal JSON verisine dönüştürmek.

SADECE geçerli JSON döndür. Markdown/açıklama/yazı döndürme.
Klinik veri kaybı YASAK: Metindeki her tıbbi bilgi mutlaka bir alana yerleşsin.

DÖNDÜRECEĞİN JSON ŞEMASI (anahtarları birebir koru):
{
	"patient": {
		"full_name": "",
		"birth_date": null,
		"age": null,
		"phone_number": null,
		"chronic_conditions": [],
		"medications": [],
		"allergies": [],
		"past_surgeries": []
	},
	"visits": [
		{
			"visit_date": "",
			"visit_type": "Kontrol",
			"last_menstrual_date": null,
			"menstrual_day": null,
			"complaint": "",
			"diagnosis": "",
			"usg": "",
			"outcome": ""
		}
	]
}

BELGE YAPISI (genel):
- Üstte hasta bilgileri olabilir: “Hastanın Adı Soyadı”, “D.T”, “Telefon numarası” vb.
- Muayeneler genellikle bir TARİH ile başlar (örn: 11.07.2025). O tarihten bir sonraki tarihe kadar olan metin o ziyarete aittir.
- Ziyarette başlıklar olabilir veya olmayabilir.

	ORPHAN METİN KURALI (kritik):
	- Ziyarette “Şikâyeti:” etiketi olmasa bile TARİH ile Muayene/USG/Reçete/Sonuç/Öneri arasında kalan açıklayıcı cümleler kaybolmayacak.
	- Bu etiketsiz metinleri complaint alanına ekle.
	- Not: Etiketsiz metin bir LAB/TEST sonucu olsa bile (TİT, kültür, spermiyogram vb.) complaint alanına da mutlaka ekle. (İstersen diagnosis’e de ekleyebilirsin.)
	- USG ölçümleri/bulguları (USG:, FKA, CRL, endometrium, folikül ölçüleri vb.) complaint’e yazma; usg alanına yaz.

MENSTRÜEL GÜN KURALI (kritik):
- “Adetinin X. Günü”, “X. Günü”, “1. Günü”, “13. Günü” gibi ifadeler USG DEĞİLDİR.
- X sayısını menstrual_day alanına yaz.
- complaint boş kalacaksa complaint içine en azından bu ifadeyi ekle.
- Bu ifade “USG:” ile aynı satırda geçse bile complaint/menstrual_day’e taşınmalı.

USG/DIAGNOSIS/OUTCOME:
- usg: sadece ultrason ölçüm/bulguları.
- diagnosis: muayene + lab + klinik değerlendirme (TİT/bakteri/kültür/spermiyogram vb.).
- outcome: reçete/tedavi/plan.
	- Karışık başlık kuralı: “Muayene Bulgusu” içinde açıkça “USG” ile başlayan veya belirgin USG terimleri (uterus/over/endometrium/folikül/FKA/CRL/GS vb.) içeren cümleler varsa bunları usg alanına taşı; diagnosis alanında tekrar etme.

Ziyaret sırası: kronolojik (en eski → en yeni).

FORMAT ZORUNLULUĞU:
- patient.birth_date ve visits[].visit_date mutlaka YYYY-MM-DD formatında olmalı. (örn 11.07.2025 → 2025-07-11)
- patient.phone_number mümkünse "+90" ile başlamalı (örn: 533 022 00 68 → +90 533 022 00 68). Yapamazsan null.

DOSYA METNİ:
<<<
${text}
>>>
`;
}

async function parseDoc(text) {
	const response = await client.chat.completions.create({
		model: 'gpt-4o',
		messages: [
			{ role: 'system', content: 'Sadece geçerli JSON döndür. Açıklama veya markdown yazma.' },
			{ role: 'user', content: buildPrompt(text) }
		],
		temperature: 0,
		response_format: { type: 'json_object' },
		max_tokens: 4000
	});

	const content = response.choices[0].message.content;
	return JSON.parse(content);
}

async function testFile(file) {
	console.log(`\n${'═'.repeat(70)}`);
	console.log(`📄 ${file.name}`);
	console.log('═'.repeat(70));

	const result = await mammoth.extractRawText({ path: file.path });
	const text = result.value;

	const data = await parseDoc(text);

	console.log(`\n👤 ${data.patient?.full_name || '(isim yok)'} (${data.patient?.birth_date || 'birth_date yok'})`);
	console.log(`   Tel: ${data.patient?.phone_number || 'yok'}`);
	console.log(`   Toplam Ziyaret: ${Array.isArray(data.visits) ? data.visits.length : 0}`);

	console.log(`\n📋 COMPLAINT FIELD ANALİZİ`);
	console.log('─'.repeat(70));

	const visits = Array.isArray(data.visits) ? data.visits : [];
	for (let i = 0; i < visits.length; i++) {
		const v = visits[i];
		const complaint = (v.complaint || '').trim();
		const status = complaint ? '✅' : '❌';
		console.log(`${status} Visit ${i + 1} (${v.visit_date || 'tarih yok'}): ${complaint ? 'DOLU' : 'BOŞ'}`);
		if (complaint) {
			const preview = complaint.replace(/\s+/g, ' ').slice(0, 120);
			console.log(`   "${preview}${complaint.length > 120 ? '...' : ''}"`);
		}
	}

	const emptyCount = visits.filter(v => !(v.complaint || '').trim()).length;
	console.log(`\n📊 Summary: ${visits.length - emptyCount}/${visits.length} visits complaint dolu`);
}

async function run() {
	console.log('\n🧪 GPT-4o ile 5 dosyada genel prompt testi');
	console.log('═'.repeat(70));

	for (const file of testFiles) {
		try {
			await testFile(file);
		} catch (err) {
			console.error(`❌ ${file.name} Error: ${err.message}`);
		}
	}

	console.log(`\n${'═'.repeat(70)}`);
	console.log('✅ TEST COMPLETE');
}

run();
