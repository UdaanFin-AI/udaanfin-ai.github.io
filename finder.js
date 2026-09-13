const $=s=>document.querySelector(s);
if(!localStorage.getItem('UdaanFin-user'))location.replace('login.html?next=loan-finder.html');
const back=$('.back-link'),themeButton=document.createElement('button');themeButton.className='theme';themeButton.setAttribute('aria-label','Toggle dark mode');back.before(themeButton);back.textContent='⌂ Home';
function theme(mode){document.body.classList.toggle('dark',mode==='dark');themeButton.textContent=mode==='dark'?'☀':'☾';localStorage.setItem('UdaanFin-theme',mode)}
theme(localStorage.getItem('UdaanFin-theme')||'light');themeButton.onclick=()=>theme(document.body.classList.contains('dark')?'light':'dark');
const locations={Delhi:['New Delhi','Dwarka','Rohini'],Maharashtra:['Mumbai','Pune','Nashik'],Karnataka:['Bengaluru','Mysuru','Hubballi'],'Tamil Nadu':['Chennai','Coimbatore','Madurai'],Punjab:['Chandigarh','Ludhiana','Amritsar'],'West Bengal':['Kolkata','Siliguri','Durgapur']};
const state=$('#state'),city=$('#city');Object.keys(locations).forEach(x=>state.add(new Option(x,x)));state.onchange=()=>{city.innerHTML='<option value="">Choose city</option>';(locations[state.value]||[]).forEach(x=>city.add(new Option(x,x)))};
$('#purpose').onchange=e=>$('#other-purpose-wrap').classList.toggle('hidden',e.target.value!=='other');
$('#loan-form').onsubmit=async e=>{e.preventDefault();if(!e.currentTarget.checkValidity()){e.currentTarget.reportValidity();return}const pan=$('#pan').value.trim().toUpperCase(),aadhaar=$('#aadhaar').value.trim();if(!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan))return alert('Please enter a valid PAN format, such as ABCDE1234F.');if(!/^\d{12}$/.test(aadhaar))return alert('Please enter a 12-digit Aadhaar number.');if($('#purpose').value==='other'&&!$('#other-purpose').value.trim())return alert('Please describe the other financial purpose.');await showResult()};
function loadData(){return window.UdaanFin_FINANCE_DATA||{loans:[],schemes:[]}}
function normalizePurpose(p){return({home:'Home Loan',education:'Education Loan',car:'Car Loan',other:'Personal Loan'})[p]||''}
function mapsLink(bank){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank+' branch near me')}`}
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function renderEmpty(title,text){return `<article class="match-empty"><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`}
function renderScheme(s){const steps=(s.apply_steps||[]).map((x,i)=>`<li>${i+1}. ${esc(x)}</li>`).join('');return `<article class="match-card scheme-card"><span class="match-kind">GOVERNMENT SCHEME · OFFLINE MATCH</span><h3>${esc(s.name)}</h3><p>${esc(s.simple)}</p><details><summary>How to apply</summary><ol>${steps}</ol></details><div class="match-actions"><a class="button button-small" target="_blank" rel="noopener" href="${esc(s.official_url)}">Open official website ↗</a></div></article>`}
function renderLoan(l){const phone=l.phone?`<a class="text-link" href="tel:${esc(l.phone)}">Call bank</a>`:'';return `<article class="match-card loan-card"><span class="match-kind">LOAN OPTION · OFFLINE DATABASE</span><h3>${esc(l.bank)} — ${esc(l.type)}</h3><p><strong>Recorded amount/range:</strong> ${esc(l.amount)}</p><p class="match-note">${esc(l.notes)}. Verify current terms before applying.</p><div class="match-actions"><a class="button button-small" target="_blank" rel="noopener" href="${esc(l.official_url)}">Open bank website ↗</a><a class="button button-small button-outline" target="_blank" rel="noopener" href="${mapsLink(l.bank)}">Find nearest branch</a>${phone}</div></article>`}
function renderLiveItem(x,kind){const title=esc(x.name||x.title||'Possible match'),url=esc(x.official_url||x.url||'https://www.myscheme.gov.in/'),summary=esc(x.summary||x.simple||'Please verify the current official details.'),steps=(x.apply_steps||[]).map((s,i)=>`<li>${i+1}. ${esc(s)}</li>`).join('');return `<article class="match-card ${kind==='scheme'?'scheme-card':'loan-card'}"><span class="match-kind">LIVE SEARCH · ${kind==='scheme'?'GOVERNMENT SCHEME':'LOAN OPTION'}</span><h3>${title}</h3><p>${summary}</p>${steps?`<details><summary>How to apply</summary><ol>${steps}</ol></details>`:''}<div class="match-actions"><a class="button button-small" target="_blank" rel="noopener" href="${url}">Open official source ↗</a></div></article>`}
function getApiBase(){return(window.UdaanFin_API_BASE||'').replace(/\/$/,'')}
async function liveSearch(profile){const base=getApiBase();if(!base)return{ok:false,reason:'offline'};try{const r=await fetch(base+'/api/live-search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(profile)});if(!r.ok)return{ok:false,reason:'server'};return await r.json()}catch(e){return{ok:false,reason:'network'}}}
async function showResult(){const purpose=$('#purpose').value,income=+$('#income').value,citizen=document.querySelector('input[name="citizen"]:checked').value,selectedState=state.value,occupation=$('#occupation').value.trim().toLowerCase(),amount=+$('#amount').value,data=loadData();let schemes=data.schemes.filter(s=>s.purpose===purpose&&(s.citizen!=='yes'||citizen==='yes')&&(s.state==='any'||s.state===selectedState)&&(!s.income_max||income<=s.income_max));schemes=schemes.filter(s=>s.name!=='Kisan Credit Card'||/farm|farmer|agri|agriculture|cultivat|dairy|fish|poultry/.test(occupation));const wantedType=normalizePurpose(purpose),loans=wantedType?data.loans.filter(l=>l.type===wantedType):[];$('#result-request').textContent=`You asked for ₹${amount.toLocaleString('en-IN')} for ${purpose==='other'?'another purpose':purpose}.`;$('#scheme-results').innerHTML=schemes.length?schemes.map(renderScheme).join(''):renderEmpty('No matching government scheme available in the offline database','No verified offline scheme record matches the details entered. This does not prove that no scheme exists. We will check live official sources when the live service is connected.');$('#loan-results').innerHTML=loans.length?loans.map(renderLoan).join(''):renderEmpty('No matching loan available in the offline database','No verified offline loan record matches this purpose yet. This does not prove that no Indian bank offers such a loan.');$('#live-results').innerHTML=renderEmpty('Checking latest official information…','The website is checking current public sources in the background.');$('#myscheme-link').href='https://www.myscheme.gov.in/find-scheme';$('#identity-status').textContent='PAN and Aadhaar ownership are NOT verified in this demo. The website only checks input format. PAN and Aadhaar are not sent to the live-search API.';$('#result').classList.remove('hidden');$('#result').scrollIntoView({behavior:'smooth',block:'start'});const live=await liveSearch({purpose,amount,state:selectedState,city:city.value,income,occupation,category:$('#category').value,citizen,language:localStorage.getItem('UdaanFin-lang')||'en'});if(!live.ok){const msg=live.reason==='offline'?'Live search is not connected in this offline copy. Offline matches above are still available; use the official myScheme search for a broader government search.':'Live verification is temporarily unavailable. Offline results above are still shown. Please use the official links to verify before applying.';$('#live-results').innerHTML=renderEmpty('Live verification unavailable right now',msg);return}const liveSchemes=Array.isArray(live.schemes)?live.schemes:[],liveLoans=Array.isArray(live.loans)?live.loans:[];if(!liveSchemes.length&&!liveLoans.length){$('#live-results').innerHTML=renderEmpty('No additional live match found',live.message||'No additional verified match was returned from the current search. This does not guarantee that no option exists.');return}$('#live-results').innerHTML=[...liveSchemes.map(x=>renderLiveItem(x,'scheme')),...liveLoans.map(x=>renderLiveItem(x,'loan'))].join('')}
/* ================================
   INDIA STATE → CITY SELECTOR
   ================================ */

const INDIA_LOCATIONS = {
  "Andhra Pradesh": {
    hi: "आंध्र प्रदेश",
    cities: {
      "Visakhapatnam": "विशाखापत्तनम",
      "Vijayawada": "विजयवाड़ा",
      "Guntur": "गुंटूर",
      "Nellore": "नेल्लोर",
      "Kurnool": "कुर्नूल",
      "Tirupati": "तिरुपति",
      "Rajahmundry": "राजमहेंद्रवरम",
      "Kadapa": "कडपा",
      "Anantapur": "अनंतपुर",
      "Kakinada": "काकीनाडा"
    }
  },

  "Arunachal Pradesh": {
    hi: "अरुणाचल प्रदेश",
    cities: {
      "Itanagar": "ईटानगर",
      "Naharlagun": "नाहरलागुन",
      "Tawang": "तवांग",
      "Pasighat": "पासीघाट",
      "Ziro": "जीरो",
      "Bomdila": "बोमडिला",
      "Tezu": "तेज़ू"
    }
  },

  "Assam": {
    hi: "असम",
    cities: {
      "Guwahati": "गुवाहाटी",
      "Dibrugarh": "डिब्रूगढ़",
      "Silchar": "सिलचर",
      "Jorhat": "जोरहाट",
      "Tezpur": "तेजपुर",
      "Nagaon": "नगांव",
      "Tinsukia": "तिनसुकिया",
      "Sivasagar": "शिवसागर"
    }
  },

  "Bihar": {
    hi: "बिहार",
    cities: {
      "Patna": "पटना",
      "Gaya": "गया",
      "Bhagalpur": "भागलपुर",
      "Muzaffarpur": "मुजफ्फरपुर",
      "Darbhanga": "दरभंगा",
      "Purnia": "पूर्णिया",
      "Ara": "आरा",
      "Begusarai": "बेगूसराय"
    }
  },

  "Chhattisgarh": {
    hi: "छत्तीसगढ़",
    cities: {
      "Raipur": "रायपुर",
      "Bhilai": "भिलाई",
      "Bilaspur": "बिलासपुर",
      "Korba": "कोरबा",
      "Durg": "दुर्ग",
      "Rajnandgaon": "राजनांदगांव",
      "Jagdalpur": "जगदलपुर",
      "Ambikapur": "अंबिकापुर"
    }
  },

  "Goa": {
    hi: "गोवा",
    cities: {
      "Panaji": "पणजी",
      "Vasco da Gama": "वास्को द गामा",
      "Margao": "मडगांव",
      "Mapusa": "मापुसा",
      "Ponda": "पोंडा"
    }
  },

  "Gujarat": {
    hi: "गुजरात",
    cities: {
      "Ahmedabad": "अहमदाबाद",
      "Surat": "सूरत",
      "Vadodara": "वडोदरा",
      "Rajkot": "राजकोट",
      "Bhavnagar": "भावनगर",
      "Jamnagar": "जामनगर",
      "Gandhinagar": "गांधीनगर",
      "Junagadh": "जूनागढ़",
      "Anand": "आनंद",
      "Bharuch": "भरूच",
      "Vapi": "वापी"
    }
  },

  "Haryana": {
    hi: "हरियाणा",
    cities: {
      "Gurugram": "गुरुग्राम",
      "Faridabad": "फरीदाबाद",
      "Panipat": "पानीपत",
      "Ambala": "अंबाला",
      "Hisar": "हिसार",
      "Karnal": "करनाल",
      "Rohtak": "रोहतक",
      "Sonipat": "सोनीपत",
      "Panchkula": "पंचकूला",
      "Yamunanagar": "यमुनानगर"
    }
  },

  "Himachal Pradesh": {
    hi: "हिमाचल प्रदेश",
    cities: {
      "Shimla": "शिमला",
      "Dharamshala": "धर्मशाला",
      "Mandi": "मंडी",
      "Solan": "सोलन",
      "Kullu": "कुल्लू",
      "Manali": "मनाली",
      "Hamirpur": "हमीरपुर",
      "Una": "ऊना"
    }
  },

  "Jharkhand": {
    hi: "झारखंड",
    cities: {
      "Ranchi": "रांची",
      "Jamshedpur": "जमशेदपुर",
      "Dhanbad": "धनबाद",
      "Bokaro": "बोकारो",
      "Deoghar": "देवघर",
      "Hazaribagh": "हजारीबाग",
      "Giridih": "गिरिडीह"
    }
  },

  "Karnataka": {
    hi: "कर्नाटक",
    cities: {
      "Bengaluru": "बेंगलुरु",
      "Mysuru": "मैसूरु",
      "Mangaluru": "मंगलुरु",
      "Hubballi": "हुब्बल्ली",
      "Belagavi": "बेलगावी",
      "Davanagere": "दावणगेरे",
      "Ballari": "बल्लारी",
      "Shivamogga": "शिवमोग्गा",
      "Tumakuru": "तुमकुरु",
      "Udupi": "उडुपी"
    }
  },

  "Kerala": {
    hi: "केरल",
    cities: {
      "Thiruvananthapuram": "तिरुवनंतपुरम",
      "Kochi": "कोच्चि",
      "Kozhikode": "कोझिकोड",
      "Thrissur": "त्रिशूर",
      "Kollam": "कोल्लम",
      "Kannur": "कन्नूर",
      "Alappuzha": "अलप्पुझा",
      "Kottayam": "कोट्टायम",
      "Palakkad": "पालक्काड"
    }
  },

  "Madhya Pradesh": {
    hi: "मध्य प्रदेश",
    cities: {
      "Bhopal": "भोपाल",
      "Indore": "इंदौर",
      "Jabalpur": "जबलपुर",
      "Gwalior": "ग्वालियर",
      "Ujjain": "उज्जैन",
      "Sagar": "सागर",
      "Dewas": "देवास",
      "Satna": "सतना",
      "Ratlam": "रतलाम",
      "Rewa": "रीवा"
    }
  },

  "Maharashtra": {
    hi: "महाराष्ट्र",
    cities: {
      "Mumbai": "मुंबई",
      "Pune": "पुणे",
      "Nagpur": "नागपुर",
      "Nashik": "नासिक",
      "Thane": "ठाणे",
      "Aurangabad": "औरंगाबाद",
      "Navi Mumbai": "नवी मुंबई",
      "Kolhapur": "कोल्हापुर",
      "Nanded": "नांदेड",
      "Solapur": "सोलापुर",
      "Amravati": "अमरावती",
      "Sangli": "सांगली"
    }
  },

  "Manipur": {
    hi: "मणिपुर",
    cities: {
      "Imphal": "इंफाल",
      "Thoubal": "थौबल",
      "Churachandpur": "चुराचांदपुर",
      "Bishnupur": "बिष्णुपुर"
    }
  },

  "Meghalaya": {
    hi: "मेघालय",
    cities: {
      "Shillong": "शिलांग",
      "Tura": "तुरा",
      "Jowai": "जोवाई",
      "Nongpoh": "नोंगपोह"
    }
  },

  "Mizoram": {
    hi: "मिज़ोरम",
    cities: {
      "Aizawl": "आइज़ोल",
      "Lunglei": "लुंगलेई",
      "Champhai": "चम्फाई",
      "Kolasib": "कोलासिब"
    }
  },

  "Nagaland": {
    hi: "नागालैंड",
    cities: {
      "Kohima": "कोहिमा",
      "Dimapur": "दीमापुर",
      "Mokokchung": "मोकोकचुंग",
      "Tuensang": "तुएनसांग"
    }
  },

  "Odisha": {
    hi: "ओडिशा",
    cities: {
      "Bhubaneswar": "भुवनेश्वर",
      "Cuttack": "कटक",
      "Rourkela": "राउरकेला",
      "Berhampur": "ब्रह्मपुर",
      "Sambalpur": "संबलपुर",
      "Puri": "पुरी",
      "Balasore": "बालासोर",
      "Baripada": "बारीपदा"
    }
  },

  "Punjab": {
    hi: "पंजाब",
    cities: {
      "Ludhiana": "लुधियाना",
      "Amritsar": "अमृतसर",
      "Jalandhar": "जालंधर",
      "Patiala": "पटियाला",
      "Bathinda": "बठिंडा",
      "Mohali": "मोहाली",
      "Pathankot": "पठानकोट",
      "Hoshiarpur": "होशियारपुर"
    }
  },

  "Rajasthan": {
    hi: "राजस्थान",
    cities: {
      "Jaipur": "जयपुर",
      "Jodhpur": "जोधपुर",
      "Udaipur": "उदयपुर",
      "Kota": "कोटा",
      "Ajmer": "अजमेर",
      "Bikaner": "बीकानेर",
      "Alwar": "अलवर",
      "Bharatpur": "भरतपुर",
      "Sikar": "सीकर",
      "Sri Ganganagar": "श्री गंगानगर"
    }
  },

  "Sikkim": {
    hi: "सिक्किम",
    cities: {
      "Gangtok": "गंगटोक",
      "Namchi": "नामची",
      "Gyalshing": "गेजिंग",
      "Mangan": "मंगन"
    }
  },

  "Tamil Nadu": {
    hi: "तमिलनाडु",
    cities: {
      "Chennai": "चेन्नई",
      "Coimbatore": "कोयंबटूर",
      "Madurai": "मदुरै",
      "Tiruchirappalli": "तिरुचिरापल्ली",
      "Salem": "सलेम",
      "Tiruppur": "तिरुप्पुर",
      "Erode": "इरोड",
      "Vellore": "वेल्लोर",
      "Thoothukudi": "तूतीकोरिन",
      "Thanjavur": "तंजावुर"
    }
  },

  "Telangana": {
    hi: "तेलंगाना",
    cities: {
      "Hyderabad": "हैदराबाद",
      "Warangal": "वारंगल",
      "Nizamabad": "निज़ामाबाद",
      "Karimnagar": "करीमनगर",
      "Khammam": "खम्मम",
      "Nalgonda": "नलगोंडा",
      "Adilabad": "आदिलाबाद"
    }
  },

  "Tripura": {
    hi: "त्रिपुरा",
    cities: {
      "Agartala": "अगरतला",
      "Udaipur": "उदयपुर",
      "Dharmanagar": "धर्मनगर",
      "Kailashahar": "कैलाशहर"
    }
  },

  "Uttar Pradesh": {
    hi: "उत्तर प्रदेश",
    cities: {
      "Lucknow": "लखनऊ",
      "Kanpur": "कानपुर",
      "Agra": "आगरा",
      "Varanasi": "वाराणसी",
      "Prayagraj": "प्रयागराज",
      "Noida": "नोएडा",
      "Ghaziabad": "गाज़ियाबाद",
      "Meerut": "मेरठ",
      "Bareilly": "बरेली",
      "Aligarh": "अलीगढ़",
      "Moradabad": "मुरादाबाद",
      "Gorakhpur": "गोरखपुर",
      "Mathura": "मथुरा",
      "Ayodhya": "अयोध्या"
    }
  },

  "Uttarakhand": {
    hi: "उत्तराखंड",
    cities: {
      "Dehradun": "देहरादून",
      "Haridwar": "हरिद्वार",
      "Nainital": "नैनीताल",
      "Haldwani": "हल्द्वानी",
      "Rishikesh": "ऋषिकेश",
      "Roorkee": "रुड़की",
      "Almora": "अल्मोड़ा",
      "Rudrapur": "रुद्रपुर"
    }
  },

  "West Bengal": {
    hi: "पश्चिम बंगाल",
    cities: {
      "Kolkata": "कोलकाता",
      "Howrah": "हावड़ा",
      "Durgapur": "दुर्गापुर",
      "Asansol": "आसनसोल",
      "Siliguri": "सिलीगुड़ी",
      "Darjeeling": "दार्जिलिंग",
      "Kharagpur": "खड़गपुर",
      "Malda": "मालदा"
    }
  },

  /* UNION TERRITORIES */

  "Andaman and Nicobar Islands": {
    hi: "अंडमान और निकोबार द्वीपसमूह",
    cities: {
      "Port Blair": "पोर्ट ब्लेयर",
      "Diglipur": "दिगलीपुर"
    }
  },

  "Chandigarh": {
    hi: "चंडीगढ़",
    cities: {
      "Chandigarh": "चंडीगढ़"
    }
  },

  "Dadra and Nagar Haveli and Daman and Diu": {
    hi: "दादरा और नगर हवेली और दमन और दीव",
    cities: {
      "Daman": "दमन",
      "Diu": "दीव",
      "Silvassa": "सिलवासा"
    }
  },

  "Delhi": {
    hi: "दिल्ली",
    cities: {
      "New Delhi": "नई दिल्ली",
      "Delhi": "दिल्ली"
    }
  },

  "Jammu and Kashmir": {
    hi: "जम्मू और कश्मीर",
    cities: {
      "Srinagar": "श्रीनगर",
      "Jammu": "जम्मू",
      "Anantnag": "अनंतनाग",
      "Baramulla": "बारामूला",
      "Kathua": "कठुआ",
      "Udhampur": "उधमपुर"
    }
  },

  "Ladakh": {
    hi: "लद्दाख",
    cities: {
      "Leh": "लेह",
      "Kargil": "कारगिल"
    }
  },

  "Lakshadweep": {
    hi: "लक्षद्वीप",
    cities: {
      "Kavaratti": "कवरत्ती",
      "Agatti": "अगत्ती",
      "Andrott": "अंद्रोत"
    }
  },

  "Puducherry": {
    hi: "पुडुचेरी",
    cities: {
      "Puducherry": "पुडुचेरी",
      "Karaikal": "कराईकल",
      "Mahe": "माहे",
      "Yanam": "यानम"
    }
  }
};


/* STATE DROPDOWN */

function setupIndiaLocationSelectors() {
  const stateSelect = document.getElementById("state");
  const citySelect = document.getElementById("city");

  if (!stateSelect || !citySelect) return;

  const isHindi = () =>
    (localStorage.getItem("UdaanFin-language") || "en") === "hi";

  function fillStates() {
    const oldState = stateSelect.value;

    stateSelect.innerHTML = "";

    const firstState = document.createElement("option");
    firstState.value = "";
    firstState.textContent = isHindi() ? "राज्य चुनें" : "Choose state";
    stateSelect.appendChild(firstState);

    Object.entries(INDIA_LOCATIONS).forEach(([state, data]) => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = isHindi() ? data.hi : state;
      stateSelect.appendChild(option);
    });

    if (INDIA_LOCATIONS[oldState]) {
      stateSelect.value = oldState;
    }

    fillCities();
  }

  function fillCities() {
    const selectedState = stateSelect.value;
    const data = INDIA_LOCATIONS[selectedState];

    citySelect.innerHTML = "";

    const firstCity = document.createElement("option");
    firstCity.value = "";
    firstCity.textContent = isHindi() ? "शहर चुनें" : "Choose city";
    citySelect.appendChild(firstCity);

    if (!data) {
      citySelect.disabled = true;
      return;
    }

    citySelect.disabled = false;

    Object.entries(data.cities).forEach(([city, hindi]) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = isHindi() ? hindi : city;
      citySelect.appendChild(option);
    });
  }

  stateSelect.addEventListener("change", fillCities);

  fillStates();

  /* Refresh labels when Hindi/English is changed */
  window.refreshIndiaLocations = fillStates;
}

document.addEventListener("DOMContentLoaded", setupIndiaLocationSelectors);
