'use strict';

// Data
const account1 = {
	owner: 'Jonas Schmedtmann',
	username: 'js',
	movements: [
		200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97,
		1300,
	],
	interestRate: 1.2, // %
	pin: 1111,

	movementsDates: [
		'2019-11-18T21:31:17.178Z',
		'2019-12-23T07:42:02.383Z',
		'2020-01-28T09:15:04.904Z',
		'2020-04-01T10:17:24.185Z',
		'2020-05-08T14:11:59.604Z',
		'2020-05-27T17:01:17.194Z',
		'2020-07-11T23:36:17.929Z',
		'2020-07-12T10:51:36.790Z',
	],
	currency: 'EUR',
	locale: 'pt-PT', // de-DE
};

const account2 = {
	owner: 'Jessica Davis',
	username: 'jd',
	movements: [
		5000, 3400, -150, -790, -3210, -1000, 8500, -30,
	],
	interestRate: 1.5,
	pin: 2222,

	movementsDates: [
		'2019-11-01T13:15:33.035Z',
		'2019-11-30T09:48:16.867Z',
		'2019-12-25T06:04:23.907Z',
		'2020-01-25T14:18:46.235Z',
		'2020-02-05T16:33:06.386Z',
		'2020-04-10T14:43:26.374Z',
		'2020-06-25T18:49:59.371Z',
		'2020-07-26T12:01:20.894Z',
	],
	currency: 'USD',
	locale: 'en-US',
};

const accounts = [account1, account2];
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector(
	'.balance__value'
);
const labelSumIn = document.querySelector(
	'.summary__value--in'
);
const labelSumOut = document.querySelector(
	'.summary__value--out'
);
const labelSumInterest = document.querySelector(
	'.summary__value--interest'
);
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements =
	document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector(
	'.form__btn--transfer'
);
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector(
	'.form__btn--close'
);
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector(
	'.login__input--user'
);
const inputLoginPin = document.querySelector(
	'.login__input--pin'
);
const inputTransferTo = document.querySelector(
	'.form__input--to'
);
const inputTransferAmount = document.querySelector(
	'.form__input--amount'
);
const inputLoanAmount = document.querySelector(
	'.form__input--loan-amount'
);
const inputCloseUsername = document.querySelector(
	'.form__input--user'
);
const inputClosePin = document.querySelector(
	'.form__input--pin'
);

//Global variables
let currentAccount = null;
let timer = null;

// Functions
const displayMovements = function (acc, sort = false) {
	containerMovements.innerHTML = '';
	let html = ``;
	const movs = sort
		? acc.movements.slice().sort((a, b) => a - b)
		: acc.movements.slice();
	movs.forEach(function (mov, i) {
		const type = mov > 0 ? `deposit` : `withdrawal`;
		const date = changeFormatDate(
			acc.movementsDates[i],
			acc.locale,
			true
		);
		const formattedMov = changeFormatNumber(
			mov,
			acc.locale,
			acc.currency
		);

		html =
			`
      	<div class="movements__row">
          <div class="movements__type movements__type--${type}">
          	${i + 1} ${type}
          </div>
		  <div class="movements__date">${date}</div>
          <div class="movements__value">
		  	${formattedMov}
		  </div>
      	</div>` + html;
	});
	containerMovements.insertAdjacentHTML('afterbegin', html);
};

const calcPrintBalance = (acc) => {
	acc.balance = acc.movements.reduce(
		(acc, mov) => acc + mov,
		0
	);
	labelBalance.textContent = changeFormatNumber(
		acc.balance,
		acc.locale,
		acc.currency
	);
};

const calcDisplaySummary = (acc) => {
	const movs = acc.movements;
	const interestRate = acc.interestRate;

	const incomes = changeFormatNumber(
		movs
			.filter((mov) => mov > 0)
			.reduce((acc, mov) => acc + mov, 0),
		acc.locale,
		acc.currency
	);
	const outcomes = changeFormatNumber(
		Math.abs(
			movs
				.filter((mov) => mov < 0)
				.reduce((acc, mov) => acc + mov, 0)
		),
		acc.locale,
		acc.currency
	);
	const interest = changeFormatNumber(
		movs
			.filter((mov) => mov > 0)
			.reduce((acc, dep) => {
				const int = Math.floor(dep * interestRate) / 100;
				return acc + (int > 1 ? int : 0);
			}, 0),
		acc.locale,
		acc.currency
	);

	labelSumInterest.textContent = interest;
	labelSumIn.textContent = incomes;
	labelSumOut.textContent = outcomes;
};

const updateUI = () => {
	displayMovements(currentAccount);
	calcPrintBalance(currentAccount);
	calcDisplaySummary(currentAccount);
};

const clearInpitFields = (...inputs) => {
	inputs.forEach((input) => {
		input.value = '';
		input.blur();
	});
};

const changeFormatNumber = (
	num,
	locale,
	currency = 'EUR'
) => {
	const options = {
		style: 'currency',
		currency: currency,
		unit: 'celsius',
	};
	return new Intl.NumberFormat(locale, options).format(
		num.toFixed(2)
	);
};

const changeFormatDate = (
	dateStr,
	locale,
	isShort = false
) => {
	const date = new Date(dateStr);
	if (isShort) {
		const options = {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		};
		return new Intl.DateTimeFormat(locale, options).format(
			date
		);
	} else {
		const options = {
			hour: 'numeric',
			minute: 'numeric',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		};
		return new Intl.DateTimeFormat(locale, options).format(
			date
		);
	}
};

const startLogoutTimer = () => {
	let time = 600;
	const tick = () => {
		const min = String(Math.floor(time / 60)).padStart(
			2,
			0
		);
		const sec = String(time % 60).padStart(2, 0);
		labelTimer.textContent = min + ':' + sec;
		if (time === 0) {
			clearInterval(timer);
			labelWelcome.textContent = 'Log in to get started';
			containerApp.style.opacity = 0;
		}
		time--;
	};
	tick();
	const timer = setInterval(tick, 1000);
	return timer;
};

const resetLogoutTimer = () => {
	clearInterval(timer);
	timer = startLogoutTimer();
};

// Event handlers
btnLogin.addEventListener('click', function (e) {
	e.preventDefault();
	currentAccount = accounts.find(
		(acc) => acc.username === inputLoginUsername.value
	);
	if (currentAccount?.pin === +inputLoginPin.value) {
		// Display UI
		labelWelcome.textContent = `Welcome back, ${currentAccount.owner.slice(
			0,
			currentAccount.owner.indexOf(' ')
		)}`;
		containerApp.style.opacity = 1;
		labelDate.textContent = changeFormatDate(
			new Date(),
			currentAccount.locale
		);

		resetLogoutTimer();
		updateUI();

		// Clear input fields
		clearInpitFields(inputLoginUsername, inputLoginPin);
	} else console.log(`try again`);
});

btnTransfer.addEventListener('click', function (e) {
	e.preventDefault();
	const amount = +inputTransferAmount.value;
	const receiverAcc = accounts.find(
		(acc) => acc.username === inputTransferTo.value
	);
	clearInpitFields(inputTransferAmount, inputTransferTo);
	resetLogoutTimer();
	if (
		amount > 0 &&
		currentAccount.balance >= amount &&
		receiverAcc &&
		currentAccount.username !== receiverAcc.username
	) {
		currentAccount.movements.push(-amount);
		currentAccount.movementsDates.push(
			new Date().toISOString()
		);

		receiverAcc.movements.push(amount);
		receiverAcc.movementsDates.push(
			new Date().toISOString()
		);
		updateUI();
	} else {
		console.log(`Something went wrong. Try again`);
	}
});

btnLoan.addEventListener('click', function (e) {
	e.preventDefault();
	const amount = Math.floor(+inputLoanAmount.value);
	if (
		amount > 0 &&
		currentAccount.movements.some(
			(mov) => mov >= amount * 0.1
		)
	) {
		currentAccount.movements.push(amount);
		currentAccount.movementsDates.push(
			new Date().toISOString()
		);
		updateUI();
	}
	clearInpitFields(inputLoanAmount);
	resetLogoutTimer();
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
	e.preventDefault();
	sorted = !sorted;
	displayMovements(currentAccount, sorted);
	resetLogoutTimer();
});

btnClose.addEventListener('click', function (e) {
	e.preventDefault();
	const confirmUsername = inputCloseUsername.value;
	const confirmPIN = +inputClosePin.value;
	if (
		confirmUsername === currentAccount.username &&
		confirmPIN === currentAccount.pin
	) {
		const index = accounts.findIndex(
			(acc) => currentAccount.username === acc.username
		);
		clearInpitFields(inputCloseUsername, inputClosePin);

		//Delete account
		accounts.splice(index, 1);

		//Hide UI
		containerApp.style.opacity = 0;
	}
});
