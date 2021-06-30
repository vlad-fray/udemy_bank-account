'use strict';

// Data
const account1 = {
	owner: 'Jonas Schmedtmann',
	movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
	interestRate: 1.2, // %
	pin: 1111,
};

const account2 = {
	owner: 'Jessica Davis',
	movements: [
		5000, 3400, -150, -790, -3210, -1000, 8500, -30,
	],
	interestRate: 1.5,
	pin: 2222,
};

const account3 = {
	owner: 'Steven Thomas Williams',
	movements: [200, -200, 340, -300, -20, 50, 400, -460],
	interestRate: 0.7,
	pin: 3333,
};

const account4 = {
	owner: 'Sarah Smith',
	movements: [430, 1000, 700, 50, 90],
	interestRate: 1,
	pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

// Functions
const displayMovements = function (
	movements,
	sort = false
) {
	containerMovements.innerHTML = '';
	let html = ``;
	const movs = sort
		? movements.slice().sort((a, b) => a - b)
		: movements.slice();
	movs.forEach(function (mov, i) {
		const type = mov > 0 ? `deposit` : `withdrawal`;
		html =
			`
      	<div class="movements__row">
          <div class="movements__type movements__type--${type}">
          	${i + 1} ${type}
          </div>
          <div class="movements__value">${mov}€</div>
      	</div>` + html;
	});
	containerMovements.insertAdjacentHTML('afterbegin', html);
};

const user = `Steven Thomas Williams`;

const createUsername = (accounts) => {
	accounts.forEach((user) => {
		user.username = user.owner
			.toLowerCase()
			.split(' ')
			.map((word) => word[0])
			.join('');
	});
};

createUsername(accounts);

const calcPrintBalance = (acc) => {
	const movs = acc.movements;
	const balance = movs.reduce((acc, mov) => acc + mov, 0);
	acc.balance = balance;
	labelBalance.textContent = `${balance} EUR`;
};

const calcDisplaySummary = (acc) => {
	const movs = acc.movements;
	const interestRate = acc.interestRate;
	const incomes = movs
		.filter((mov) => mov > 0)
		.reduce((acc, mov) => acc + mov, 0);
	const outcomes = Math.abs(
		movs
			.filter((mov) => mov < 0)
			.reduce((acc, mov) => acc + mov, 0)
	);
	const interest = movs
		.filter((mov) => mov > 0)
		.reduce((acc, dep) => {
			const int = Math.floor(dep * interestRate) / 100;
			return acc + (int > 1 ? int : 0);
		}, 0);
	labelSumInterest.textContent = `${interest}€`;
	labelSumIn.textContent = `${incomes}€`;
	labelSumOut.textContent = `${outcomes}€`;
};

const updateUI = () => {
	displayMovements(currentAccount.movements);
	calcPrintBalance(currentAccount);
	calcDisplaySummary(currentAccount);
};

const clearInpitFields = (...inputs) => {
	inputs.forEach((input) => {
		input.value = '';
		input.blur();
	});
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
	if (
		amount > 0 &&
		currentAccount.balance >= amount &&
		receiverAcc &&
		currentAccount.username !== receiverAcc.username
	) {
		currentAccount.movements.push(-amount);
		receiverAcc.movements.push(amount);
		updateUI();
	} else {
		console.log(`Something went wrong. Try again`);
	}
});

btnLoan.addEventListener('click', function (e) {
	e.preventDefault();
	const amount = +inputLoanAmount.value;
	if (
		amount > 0 &&
		currentAccount.movements.some(
			(mov) => mov >= amount * 0.1
		)
	) {
		currentAccount.movements.push(amount);
		updateUI();
	}
	clearInpitFields(inputLoanAmount);
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
	e.preventDefault();
	sorted = !sorted;
	displayMovements(currentAccount.movements, sorted);
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
