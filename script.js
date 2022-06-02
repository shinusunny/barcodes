'use strict';

// register service worker for pwa
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then(function (registration) {
      console.log('Registration successful, scope is:', registration.scope);
    })
    .catch(function (error) {
      console.log('Service worker registration failed, error:', error);
    });
}

// main Barcode object
const Barcode = {
  types: {
    8: 'GTIN-8',
    12: 'GTIN-12',
    13: 'GTIN-13',
    14: 'GTIN-14',
    17: 'GSIN',
    18: 'SSSC',
  },

  twoMinus: [0, 2, 4, 6, 8, 9, 1, 3, 5, 7],
  threePlus: [0, 3, 6, 9, 2, 5, 8, 1, 4, 7],
  fivePlus: [0, 5, 1, 6, 2, 7, 3, 8, 4, 9],
  fiveMinus: [0, 5, 9, 4, 8, 3, 7, 2, 6, 1],
  threeAdd: [0, 7, 4, 1, 8, 5, 2, 9, 6, 3],
  fiveAdd: [0, 9, 7, 5, 3, 1, 8, 6, 4, 2],

  gs1Reset() {
    this.gs1Dtls = {};
  },

  price392(ai, price) {
    let priceMinor;
    const re = /^392(\d)/;
    const found = ai.match(re);
    if (found) {
      priceMinor = parseInt((price * 100) / 10 ** found[1]);
    }
    return priceMinor;
  },

  gs1: {
    '01': {
      len: 14,
      FNC1: 0,
      desc: 'Global Trade Item Number (GTIN)',
      fun(gtin) {
        Barcode.gs1Dtls.gtin14 = gtin;
        Barcode.gs1Dtls.ean13 = gtin.slice(1, 14);
      },
    },
    15: {
      len: 6,
      FNC1: 0,
      desc: 'Best before date (YYMMDD)',
      fun(expiry) {
        Barcode.gs1Dtls.expiry = expiry;
        Barcode.gs1Dtls.expiryType = '15';
      },
    },
    16: {
      len: 6,
      FNC1: 0,
      desc: 'Sell by date (YYMMDD)',
      fun(expiry) {
        Barcode.gs1Dtls.expiry = expiry;
        Barcode.gs1Dtls.expiryType = '16';
      },
    },
    17: {
      len: 6,
      FNC1: 0,
      desc: 'Expiration date (YYMMDD)',
      fun(expiry) {
        Barcode.gs1Dtls.expiry = expiry;
        Barcode.gs1Dtls.expiryType = '17';
      },
    },
    3920: {
      len: 6,
      FNC1: 1,
      desc: 'Price 0 decimal',
      fun(ai, price) {
        Barcode.gs1Dtls.priceMinor = Barcode.price392(ai, price);
      },
    },
    3921: {
      len: 7,
      FNC1: 1,
      desc: 'Price 1 decimal',
      fun(ai, price) {
        Barcode.gs1Dtls.priceMinor = Barcode.price392(ai, price);
      },
    },
    3922: {
      len: 8,
      FNC1: 1,
      desc: 'Price 2 decimal',
      fun(ai, price) {
        Barcode.gs1Dtls.priceMinor = Barcode.price392(ai, price);
      },
    },
    3923: {
      len: 9,
      FNC1: 1,
      desc: 'Price 3 decimal',
      fun(ai, price) {
        Barcode.gs1Dtls.priceMinor = Barcode.price392(ai, price);
      },
    },
    3924: {
      len: 10,
      FNC1: 1,
      desc: 'Price 4 decimal',
      fun(ai, price) {
        Barcode.gs1Dtls.priceMinor = Barcode.price392(ai, price);
      },
    },
    3925: {
      len: 11,
      FNC1: 1,
      desc: 'Price 5 decimal',
      fun(ai, price) {
        Barcode.gs1Dtls.priceMinor = Barcode.price392(ai, price);
      },
    },
    3926: {
      len: 12,
      FNC1: 1,
      desc: 'Price 6 decimal',
      fun(ai, price) {
        Barcode.gs1Dtls.priceMinor = Barcode.price392(ai, price);
      },
    },
    3927: {
      len: 13,
      FNC1: 1,
      desc: 'Price 7 decimal',
      fun(ai, price) {
        Barcode.gs1Dtls.priceMinor = Barcode.price392(ai, price);
      },
    },
    3928: {
      len: 14,
      FNC1: 1,
      desc: 'Price 8 decimal',
      fun(ai, price) {
        Barcode.gs1Dtls.priceMinor = Barcode.price392(ai, price);
      },
    },
    3929: {
      len: 15,
      FNC1: 1,
      desc: 'Price 9 decimal',
      fun(ai, price) {
        Barcode.gs1Dtls.priceMinor = Barcode.price392(ai, price);
      },
    },
  },

  cdValidate(ean) {
    let valid = true;
    if (isNaN(ean) || ean <= 0 || !this.types[ean.length + 1]) {
      const errMsg = Object.entries(this.types)
        .map(([k, v]) => `${k - 1} (${v})`)
        .join(', ');
      alert(`Entered length: ${ean.length}\nValid lengths: ${errMsg}`);
      valid = false;
    }
    return valid;
  },

  pcdValidate(ean) {
    let valid = true;
    if (isNaN(ean) || ean <= 0 || ean.length !== 13 || +ean[0] !== 2 || ![1, 2, 3, 4, 7, 8, 9].includes(+ean[1])) {
      const errMsg = Object.entries(this.types)
        .filter(([k, _]) => [13].includes(+k))
        .map(([k, v]) => `${k} (${v})`)
        .join(', ');
      alert(
        `Entered length: ${ean.length}\nValid lengths: ${errMsg}\nOther Validations: starts with 2 followed by 1, 2, 3, 4, 7, 8 or 9`
      );
      valid = false;
    }
    return valid;
  },

  gs1Validate(ean) {
    this.gs1Reset();
    this.gs1.Barcode = ean;
    const eanArr = [...ean];
    let eanRem = ean;
    let ai = '';
    let valid = false;
    let re, found;
    for (let i = 0; i < eanArr.length; i++) {
      ai = ai.concat(eanArr[i]);
      console.log(i, ai);
      if (ai in this.gs1) {
        let gs1Item = this.gs1[ai];
        let len = gs1Item.len;
        eanRem = eanArr.slice(i + 1).join('');
        console.log('remaining', eanRem);
        console.log('gs1item', gs1Item);
        if (gs1Item.FNC1) {
          valid = false;
          re = new RegExp(String.raw`^(\d{0,${len}})([~_]?)(.*)?`);
          console.log(re);
          found = eanRem.match(re);
          console.log('found fnc1', found);
          if (found) {
            valid = true;
            i += found[1].length + found[2]?.length;
            re = /[^\d~_]/;
            if (found[3]) console.log('found fnc1 #3', found[3].match(re));
            if (found[3] && (!found[2] || found[3].match(re))) {
              valid = false;
              break;
            }
            gs1Item.fun(ai, found[1]);
          }
        } else {
          re = new RegExp(String.raw`^(\d{${len}})(.*)?`);
          found = eanRem.match(re);
          console.log('found not fnc1', found);
          if (found) {
            valid = true;
            i += len;
          } else {
            valid = false;
            break;
          }
          gs1Item.fun(found[1]);
        }
        ai = '';
      }
    }
    console.log(Barcode);
    return valid;
  },

  checkDigit(ean) {
    const digits = [...ean].reverse();
    const { even, odd } = digits.reduce(
      (sum, cur, i) => {
        sum[i % 2 == 0 ? 'even' : 'odd'] += +cur;
        return sum;
      },
      { even: 0, odd: 0 }
    );
    let cd = (odd + even * 3) % 10;
    return cd == 0 ? 0 : 10 - cd;
  },

  pcdFourDigitPrice(ean) {
    const digits = [...ean];
    let sum =
      this.twoMinus[digits[8]] + this.twoMinus[digits[9]] + this.threePlus[digits[10]] + this.fiveMinus[digits[11]];

    sum %= 10;
    return sum == 0 ? 0 : this.threeAdd[10 - sum];
  },

  pcdFiveDigitPrice(ean) {
    const digits = [...ean];
    let sum =
      this.fivePlus[digits[7]] +
      this.twoMinus[digits[8]] +
      this.fiveMinus[digits[9]] +
      this.fivePlus[digits[10]] +
      this.twoMinus[digits[11]];

    sum %= 10;
    return sum == 0 ? 0 : this.fiveAdd[10 - sum];
  },
};

// select elements for selection page
const cdMenu = document.querySelector('.section-0');

// display section
const showSection = function (sect, button) {
  document.querySelectorAll('section').forEach((elem, i) => {
    if (i > 0) elem.style.display = 'none';
  });

  cdMenu.querySelectorAll('.btn-select').forEach(elem => {
    elem.style.opacity = elem !== button && sect ? 0.5 : 1;
  });

  if (sect) sect.style.display = 'block';
};

// select elements for check digit page
const cdBtn = document.getElementById('cd-btn');
const cdInp = document.querySelector('.cd-inp');
const cdRes = document.querySelector('.cd-res');
const cdEan = document.querySelector('.cd-ean');
const cdCdg = document.querySelector('.cd-cd');
const cdTyp = document.querySelector('.cd-typ');
const cdCpy = document.getElementById('cd-cpy');

// select elements for price check digit page
const pdBtn = document.getElementById('pd-btn');
const pdInp = document.querySelector('.pd-inp');
const pdRes = document.querySelector('.pd-res');
const pdEan = document.querySelector('.pd-ean');
const pdTyp = document.querySelector('.pd-typ');
const pdCpy = document.getElementById('pd-cpy');

// select elements for price check digit page
const gs1Btn = document.getElementById('gs1-btn');
const gs1Inp = document.querySelector('.gs1-inp');
const gs1Res = document.querySelector('.gs1-res');
const gs1Dtls = document.querySelector('.gs1-dtls');

// initialize
const init = function () {
  showSection();
  cdRes.style.visibility = 'hidden';
  pdRes.style.visibility = 'hidden';
};

init();

cdMenu.addEventListener('click', function (e) {
  const clicked = e.target.closest('.btn-select');
  if (!clicked) return;
  const toSection = document.querySelector(`.section-${clicked.dataset.button}`);
  showSection(toSection, clicked);
  toSection.scrollIntoView({ behavior: 'smooth' });
  e.preventDefault();
});

// functions for check digit section
cdBtn.addEventListener('click', function (e) {
  cdRes.style.visibility = 'hidden';

  const ean = cdInp.value;
  if (Barcode.cdValidate(ean)) {
    const cd = Barcode.checkDigit(ean);
    cdEan.textContent = '';
    cdEan.insertAdjacentHTML('beforeend', `${ean}<span class="cd-cd">${cd}</span>`);
    cdTyp.textContent = `(${Barcode.types[ean.length + 1]})`;
    cdRes.style.visibility = 'visible';
  }
  e.preventDefault();
});

cdInp.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    cdBtn.click();
    e.preventDefault();
  }
});

cdCpy.addEventListener('click', function (e) {
  navigator.clipboard.writeText(cdEan.textContent.concat(cdCdg.textContent));
  e.preventDefault();
});

// functions for price check digit section
pdBtn.addEventListener('click', function (e) {
  pdRes.style.visibility = 'hidden';

  let pdi = pdInp.value;
  let pde = '';
  if (Barcode.pcdValidate(pdi)) {
    let ean = `${pdi.slice(0, pdi.length - 1)}`.padStart(12, '0');
    const prc4 = [3, 4].includes(+ean[1]);
    let pdp = prc4 ? 7 : 6;
    let pd = prc4 ? Barcode.pcdFourDigitPrice(ean) : Barcode.pcdFiveDigitPrice(ean);
    pde = `${ean.slice(0, pdp)}${pd}${ean.slice(pdp + 1)}`;
    pdEan.textContent = pde.concat(Barcode.checkDigit(pde));
    pdTyp.textContent = `${prc4 ? '(4-digit Price Field)' : '(5-digit Price Field)'}`;
    pdRes.style.visibility = 'visible';
  }
  e.preventDefault();
});

pdInp.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    pdBtn.click();
    e.preventDefault();
  }
});

pdCpy.addEventListener('click', function (e) {
  navigator.clipboard.writeText(pdEan.textContent);
  e.preventDefault();
});

// functions for validate gs1 section
gs1Btn.addEventListener('click', function (e) {
  gs1Res.style.visibility = 'hidden';

  let ean = gs1Inp.value;
  if (Barcode.gs1Validate(ean)) {
    gs1Dtls.textContent = Object.entries(Barcode.gs1Dtls)
      .map(([k, v]) => `${k} ${v}`)
      .join('\n');
    gs1Res.style.visibility = 'visible';
  } else {
    alert(`Entered length: ${ean.length}\nError: Invalid GS1 Barcode`);
  }
  e.preventDefault();
});

gs1Inp.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    gs1Btn.click();
    e.preventDefault();
  }
});
