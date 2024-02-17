function generatePrimes(limit) {
    const primes = [2];
    const isPrime = new Array(limit + 1).fill(true);
    isPrime[0] = isPrime[1] = false;

    for (let num = 3; num <= Math.sqrt(limit); num += 2) {
        if (isPrime[num]) {
            primes.push(num);
            for (let multiple = num * num; multiple <= limit; multiple += num * 2) {
                isPrime[multiple] = false;
            }
        }
    }

    for (let num = Math.max(3, Math.ceil(Math.sqrt(limit))) + (1 - Math.max(3, Math.ceil(Math.sqrt(limit))) % 2); num <= limit; num += 2) {
        if (isPrime[num]) {
            primes.push(num);
        }
    }

    return primes;
}
function toCard(index) {
    switch(index) {
        case 10:
            return 'T';
        case 11:
            return 'J';
        case 12:
            return 'Q';
        case 13:
            return 'K';
        default:
            return index.toString(); // 数字を文字列に変換
    }
}
function cardsToDetails(cards) {
    const cardCount = new Array(14).fill(0); // 1から13までの各要素が対応するカードの枚数

    for (let i = 0; i < cards.length; i++) {
        const card = cards.charAt(i);
        switch (card) {
            case 'T':
                cardCount[10]++;
                break;
            case 'J':
                cardCount[11]++;
                break;
            case 'Q':
                cardCount[12]++;
                break;
            case 'K':
                cardCount[13]++;
                break;
            default:
                cardCount[parseInt(card)]++;
                break;
        }
    }

    return cardCount;
}
function detailsToCards(cardCount) {
    let formatCards = "";
    for (let i = 1; i < cardCount.length; i++) { // インデックス0は使用されないため1から開始
        const card = toCard(i);
        formatCards += card.repeat(cardCount[i]); // toCardの結果をcardCount[i]の回数だけ繰り返し
    }
    return formatCards;
}
function numToCards(i, s, tmp, results) {
    if (i === s.length) {
        // 文字列の末尾に到達
        results.push(tmp);
        return;
    }

    if (s[i] !== '0') {
        tmp += s[i];
        numToCards(i + 1, s, tmp, results);
        tmp = tmp.slice(0, -1); // 最後の文字を削除
    }

    if (i + 1 < s.length && s[i] === '1' && ('0' <= s[i + 1] && s[i + 1] <= '3')) {
        let card = '';
        switch(s[i + 1]) {
            case '0':
                card = 'T';
                break;
            case '1':
                card = 'J';
                break;
            case '2':
                card = 'Q';
                break;
            case '3':
                card = 'K';
                break;
        }
        tmp += card;
        numToCards(i + 2, s, tmp, results);
        tmp = tmp.slice(0, -1); // 最後の文字を削除
    }
}
function cardsToNum(cards) {
    let numStr = '';
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        switch(card) {
            case 'T':
                numStr += '10';
                break;
            case 'J':
                numStr += '11';
                break;
            case 'Q':
                numStr += '12';
                break;
            case 'K':
                numStr += '13';
                break;
            default:
                numStr += card; // 数字カードはそのまま追加
                break;
        }
    }
    return numStr;
}
function generateQuizzes(goodsizePrimeList) {
    const fivecardsQuizList = [];

    goodsizePrimeList.forEach(prime => {
        const cards1Results = [];
        const cards2Results = [];

        numToCards(0, prime.toString(), '', cards1Results);
        numToCards(0, (prime * 2).toString(), '', cards2Results);

        cards1Results.forEach(cards1 => {
            cards2Results.forEach(cards2 => {
                if (cards1.length === 5 && cards2.length === 5) {
                    const details1 = cardsToDetails(cards1);
                    const details2 = cardsToDetails(cards2);

                    const quiz = details1.map((count, i) => count + details2[i]);
                    fivecardsQuizList.push(quiz);
                }
            });
        });
    });

    return fivecardsQuizList;
}

// 素数を生成
let primeList = generatePrimes(1000000);
// 10,000以上の素数のみを抽出
let goodsizePrimeList = primeList.filter(prime => prime >= 10000);
// クイズを生成
let fivecardsQuizList = generateQuizzes(goodsizePrimeList);

//フィルター1
let quizList = [];
fivecardsQuizList.forEach(quiz => {
    if (quiz[0] === 0) {
        quiz[2] += 1;
        if (quiz.every(value => value <= 4)) { // 全ての値が4以下か確認
            quizList.push(quiz);
        }
    }
});
//フィルター2　ここが一番怪しい
// quizListから重複を排除
const uniqueQuizzesSet = new Set();
quizList.forEach(quiz => {
    // 配列を文字列に変換してセットに追加
    const quizStr = JSON.stringify(quiz);
    uniqueQuizzesSet.add(quizStr);
});
// 文字列を再び配列に変換してユニークなクイズリストを作成
const uniqueQuizList = Array.from(uniqueQuizzesSet).map(quizStr => JSON.parse(quizStr));

//フィルター3
let formatQuizList = [];
uniqueQuizList.forEach(quiz => {
    const formatQuiz = detailsToCards(quiz); // クイズをカードの形式に変換
    formatQuizList.push([formatQuiz, quiz]); // 変換したフォーマットと元のクイズのペアを追加
});

function getRandomSubarray(arr, size) {
    let shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

// formatQuizListからランダムに10個のクイズを選択
const randomSelection = getRandomSubarray(formatQuizList, 10);
/*
// 旧：選択されたクイズをページに表示
const quizContainer = document.getElementById('quiz-container');
randomSelection.forEach((quiz, index) => {
    const quizElement = document.createElement('div');
    quizElement.textContent = `Q ${index + 1}: ${quiz[0]}`;
    quizContainer.appendChild(quizElement);
});
*/
//正誤判定を独立した関数として実装
function checkAnswer(guess, quiz) {
    let factorDetail = cardsToDetails(guess);
    let factorNum = parseInt(cardsToNum(guess));
    let nibaiCards = [];
    numToCards(0, String(factorNum * 2), '', nibaiCards);
    let equationCorrect = false;
    for (let cards of nibaiCards) {
        let nibaiDetail = cardsToDetails(cards);
        let allDetail = factorDetail.map((detail, i) => detail + nibaiDetail[i]);
        allDetail[2] += 1;
        if (JSON.stringify(allDetail) === JSON.stringify(quiz)) {
            equationCorrect = true;
            break;
        }
    }

    if (equationCorrect) {
        let easyDivisible = false;
        const divisors = [2, 3, 5, 7, 11, 13];
        for (let divisor of divisors) {
            if (factorNum % divisor === 0) {
                easyDivisible = true;
                return { result: "divisible", divisor: divisor };
            }
        }
        if (!easyDivisible) {
            if (primeList.includes(factorNum)) { // primeListはあらかじめ定義された素数リスト
                return { result: "HNC" };
            } else {
                return { result: "NIBAI" };
            }
        }
    } else {
        return { result: "incorrect" };
    }
}

// ログを更新する関数
function updateLog(question, feedback) {
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<strong>問題:</strong> ${question} <br> <strong>結果:</strong> ${feedback}`;
    document.getElementById('log').appendChild(logEntry);
}

// ツイート文面を生成する関数
function generateTweetText(score) {
    return `私のスコアは${score}点です！ #にばいめーかー`;
}

// ゲーム終了時に呼び出される関数
function gameFinished(score) {
    const tweetText = `#にばいめーかー 10問を${score}秒でクリアしました！\nhttps://green-plus.github.io/nibaimaker/`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    // 既存のボタンがあれば削除
    const existingButton = document.querySelector('#tweetButtonContainer a');
    if (existingButton) {
        existingButton.parentNode.removeChild(existingButton);
    }

    // 新しいツイートボタンを作成
    const tweetButton = document.createElement('a');
    tweetButton.setAttribute('href', tweetUrl);
    tweetButton.setAttribute('target', '_blank');
    tweetButton.textContent = 'ツイート';

    // ボタンをページに追加
    document.getElementById('tweetButtonContainer').appendChild(tweetButton);
}



function generateQuiz() {
    let currentQuiz = 0;
    let startTime = Date.now();

    // クイズを表示する関数
    function displayQuiz() {
        document.getElementById('quiz').textContent = "Q" + (currentQuiz + 1) + ": " + randomSelection[currentQuiz][0];
        document.getElementById("answer").focus();
    }
    //submitHandler
    function submitHandler() {
        // submitボタンがクリックされたとき、またはEnterキーが押されたときに実行される処理
        let question = randomSelection[currentQuiz][0];
        let userAnswer = document.getElementById('answer').value;
        let userAnswerNum = cardsToNum(userAnswer);
        // 回答の正誤判定を行う
        let answerCondition = checkAnswer(userAnswer, randomSelection[currentQuiz][1]);
        let feedbackText = ""; // フィードバックのテキストを初期化
        document.getElementById('answer').value = ''; // 入力フィールドをクリア
        // フィードバックの表示とクイズの進行制御
        if (answerCondition.result === "incorrect") {
            feedbackText = `${userAnswerNum} cannot make a correct equation. Try again.`;
        } else if (answerCondition.result === "divisible") {
            feedbackText = `${userAnswerNum} is divisible by ${answerCondition.divisor} . Try again.`;
        } else if (answerCondition.result === "HNC" || answerCondition.result === "NIBAI") {
            let correctMessage = answerCondition.result === "HNC" ? `${userAnswerNum} is an HNC factor!` : `${userAnswerNum} is a NIBAI factor!`;
            feedbackText = correctMessage;

            // 次の問題に進む準備
            currentQuiz++;

            if (currentQuiz < randomSelection.length) {
                displayQuiz(); // 次のクイズを表示
            } else {
                let endTime = Date.now();
                let elapsed = (endTime - startTime) / 1000;
                document.getElementById('quiz').textContent = "終了！経過時間: " + elapsed + "秒";
                document.getElementById('answer').style.display = 'none';
                document.getElementById('submit').style.display = 'none';
                gameFinished(elapsed);
            }
        }

        // フィードバックのテキストを表示
        document.getElementById('feedback').textContent = feedbackText;

        // 問題のログを更新
        updateLog(question, feedbackText);
    }

    displayQuiz(); // 初期クイズを表示

    // submitボタンがクリックされたときのイベントリスナー
    document.getElementById('submit').addEventListener('click', submitHandler);

    // 入力欄でEnterキーが押されたときのイベントリスナー
    document.getElementById('answer').addEventListener('keydown', function(event) {
        if (event.key === "Enter") {
            submitHandler();
        }
    });
};

generateQuiz();
