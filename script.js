'use strict';

const barcode = {
  types: {
    8: 'GTIN-8',
    12: 'GTIN-12',
    13: 'GTIN-13',
    14: 'GTIN-14',
    17: 'GSIN',
    18: 'SSSC',
  },

  validate(ean) {
    let valid = true;
    if (isNaN(ean) || !this.types[ean.length + 1]) {
      const errMsg = Object.entries(this.types)
        .map(([k, v]) => `${k - 1} (${v})`)
        .join(', ');
      alert(`Entered length: ${ean.length}\nValid lengths: ${errMsg}`);
      valid = false;
    }
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
    return (10 - ((odd + even * 3) % 10)) % 10;
  },
};

const cdInp = document.querySelector('#cd-inp');
const cdBtn = document.querySelector('#cd-btn');
const cdRes = document.querySelector('#cd-res');
const cdGtin = document.querySelector('#cd-gtin');
const cdCpy = document.querySelector('#cd-cpy');

cdCpy.style.visibility = 'hidden';

cdBtn.addEventListener('click', function (e) {
  cdRes.textContent = '';
  cdCpy.style.visibility = 'hidden';

  const ean = cdInp.value;
  if (barcode.validate(ean)) {
    const cd = barcode.checkDigit(ean);
    cdRes.textContent = `${cd} (${barcode.types[ean.length + 1]})`;
    cdGtin.textContent = `${ean} ${cd}`;
    cdCpy.style.visibility = 'visible';
  }

  e.preventDefault();
});

cdCpy.addEventListener('click', function (e) {
  navigator.clipboard.writeText(cdGtin.textContent.trim().replace(/\s/g, ''));

  e.preventDefault();
});
