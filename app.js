const VAT_RATE = 0.14;

const payeBands = [
  { upTo: 48000, rate: 0, base: 0, excess: 0 },
  { upTo: 84000, rate: 0.05, base: 0, excess: 48000 },
  { upTo: 120000, rate: 0.125, base: 1800, excess: 84000 },
  { upTo: 156000, rate: 0.1875, base: 6300, excess: 120000 },
  { upTo: Infinity, rate: 0.265, base: 13050, excess: 156000 }
];

function money(value){return new Intl.NumberFormat('en-BW',{style:'currency',currency:'BWP',maximumFractionDigits:2}).format(value || 0).replace('BWP','P');}
function renderResult(id, rows){document.getElementById(id).innerHTML = rows.map(r=>`<div class="metric"><span>${r.label}</span><strong>${r.value}</strong></div>`).join('');}
function getNumber(id){return Number(document.getElementById(id).value) || 0;}

function calculateAnnualPAYE(taxable){
  const band = payeBands.find(b => taxable <= b.upTo);
  return Math.max(0, band.base + ((taxable - band.excess) * band.rate));
}
function calculatePAYE(){
  const grossMonthly = getNumber('monthlySalary');
  const deductionMonthly = getNumber('monthlyDeduction');
  const annualTaxable = Math.max(0, (grossMonthly - deductionMonthly) * 12);
  const annualPAYE = calculateAnnualPAYE(annualTaxable);
  const monthlyPAYE = annualPAYE / 12;
  const netMonthly = grossMonthly - deductionMonthly - monthlyPAYE;
  const effectiveRate = annualTaxable ? (annualPAYE / annualTaxable * 100) : 0;
  renderResult('payeResult', [
    {label:'Annual taxable income', value:money(annualTaxable)},
    {label:'Estimated monthly PAYE', value:money(monthlyPAYE)},
    {label:'Estimated net after deduction & PAYE', value:money(netMonthly)},
    {label:'Effective tax rate', value:effectiveRate.toFixed(2)+'%'}
  ]);
}
function calculateVAT(){
  const amount = getNumber('vatAmount');
  const mode = document.getElementById('vatMode').value;
  let exclusive, vat, inclusive;
  if(mode === 'add'){exclusive = amount; vat = amount * VAT_RATE; inclusive = amount + vat;} else {inclusive = amount; exclusive = amount / (1 + VAT_RATE); vat = inclusive - exclusive;}
  renderResult('vatResult', [
    {label:'VAT-exclusive amount', value:money(exclusive)},
    {label:'VAT at 14%', value:money(vat)},
    {label:'VAT-inclusive amount', value:money(inclusive)},
    {label:'VAT fraction', value:'14 / 114'}
  ]);
}
function calculateWHT(){
  const amount = getNumber('whtAmount');
  const rate = Number(document.getElementById('whtType').value) / 100;
  const tax = amount * rate;
  renderResult('whtResult', [
    {label:'Gross payment', value:money(amount)},
    {label:'WHT rate', value:(rate*100).toFixed(2)+'%'},
    {label:'Tax to withhold', value:money(tax)},
    {label:'Net payment', value:money(amount-tax)}
  ]);
}
function calculateCIT(){
  const profit = getNumber('profit');
  const rate = Number(document.getElementById('citRate').value) / 100;
  const tax = profit * rate;
  renderResult('citResult', [
    {label:'Taxable profit', value:money(profit)},
    {label:'Selected tax rate', value:(rate*100).toFixed(2)+'%'},
    {label:'Estimated tax payable', value:money(tax)},
    {label:'Profit after estimated tax', value:money(profit-tax)}
  ]);
}

document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.calculator').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.tab).classList.add('active');
}));

calculatePAYE(); calculateVAT(); calculateWHT(); calculateCIT();
