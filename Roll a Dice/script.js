var list = document.querySelectorAll('img');

const first = Math.floor(Math.random() * 6)+1; 

const imageFirst = 'assets/dice'+first+'.png';
list[0].setAttribute('src', imageFirst);

/*  0 to 1
    0.1 - 0.9 * 6
    0.6 - 5.4
    0 - 5 + 1
    1 - 6      */

const second = Math.floor(Math.random() * 6)+1; 
const imageSecond = 'assets/dice'+second+'.png';
list[1].setAttribute('src', imageSecond);


if(first > second){
	document.querySelector('h1').innerHTML = "winner is user 1";
}
else if(second > first){
	document.querySelector('h1').innerHTML = "winner is user 2";
}
else{
	document.querySelector('h1').innerHTML = "It is a Tie/draw!!!";
}