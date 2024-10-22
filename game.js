document.addEventListener('DOMContentLoaded', () => {
    // 获取音乐文件和 canvas 元素
    const audio = document.getElementById('backgroundMusic');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 变量来存储当前乐谱信息
    let bpm = 120; // 默认BPM
    let beatInterval = 500;
    let score = []; // 存储乐谱动作
    let currentBeat = 0;

    // 猫咪对象
    let cat = {
        x: canvas.width / 2 - 50,
        y: canvas.height / 2 - 120,
        width: 100,
        height: 100,
        color: '#fff'  // 白色猫咪
    };

    // 猫咪状态
    let catAction = 'idle'; // 默认状态是空闲

    // 手状态
    let dodgeSuccess = false;  // 记录闪避是否成功
    let hitResult = "";        // 记录是否命中或闪避成功的结果

    // 手的对象
    let hand = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 40,
        width: 50,
        height: 20,
        color: '#fff',  // 白色手
        originalY: canvas.height - 40,  // 原始Y位置，用于归位
        dodgeY: canvas.height - 20,     // 向下移动的目标Y位置
        isDodging: false               // 是否处于闪避状态
    };

    // 通过 fetch API 读取乐谱 JSON 文件
    function loadScore(scoreName) {
        fetch('./assets/score.json')  // 确保路径正确
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const selectedScore = data.scores.find(score => score.name === 'easy');
                if (selectedScore) {
                    score = selectedScore.notes;
                    bpm = selectedScore.bpm;
                    beatInterval = (60 / bpm) * 10000; // 计算每个节拍的时间间隔
                    console.log(`Loaded easy score with BPM: ${bpm}`);
                }
            })
            .catch(error => console.error('Error loading score:', error));
    }

    // 猫咪动作函数
    function performCatAction(action) {
        if (action === 1) {
            catAction = 'meow'; // 喵喵叫
            console.log("Cat is meowing!");
            hitResult = "";
        } else if (action === 2) {
            catAction = 'bite'; // 咬手
            console.log("Cat is biting!");

            // 攻击判定
            if (hand.isDodging) {
                dodgeSuccess = true;
                hitResult = "Good!";
            } else {
                dodgeSuccess = false;
                hitResult = "Ouch!";
            }

        } else {
            catAction = 'idle'; // 没有动作
            console.log("Cat is idle");
        }


        drawGame(); // 重新绘制游戏
    }

    // 手的闪避动作
    canvas.addEventListener('touchstart', function (e) {
        if (!hand.isDodging) {
            hand.isDodging = true;  // 标记进入闪避状态
            hitResult = "";

            // 手向下移动
            hand.y = hand.dodgeY;
            drawGame();

            // 设定延时，0.2 秒后手归位
            setTimeout(() => {
                hand.y = hand.originalY; // 恢复原位
                drawGame(); // 重绘游戏
                hand.isDodging = false; // 恢复可闪避状态
            }, 300);  // 200毫秒后归位
        }
    });

    // 游戏启动函数，开始根据乐谱同步猫咪的动作
    function startGame() {
        audio.play(); // 播放音乐
        currentBeat = 0; // 重置当前节拍

        const intervalId = setInterval(() => {

            // 执行动作
            performCatAction(score[currentBeat]);
            
            if (currentBeat < score.length - 1){
                currentBeat++;
            } else {
                currentBeat = 0;
            }

        }, beatInterval);
    }

    // 监听音乐的播放事件
    audio.addEventListener('play', startGame);

    audio.addEventListener('play', () => {
        console.log("Music is playing, starting game...");
        startGame(); // 开始同步动作
    });

    audio.addEventListener('pause', () => {
        console.log("Music paused.");
    });

    audio.addEventListener('ended', () => {
        console.log("Music ended.");
    });

    // 绘制猫咪的状态
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // 清空画布

        // 设置字体和颜色
        ctx.font = "20px Arial";  // 设置字体大小和样式
        ctx.fillStyle = "#fff";    // 确保文字颜色为白色，便于在黑色背景上显示

        if (catAction === 'meow') {
            // 绘制猫咪喵喵叫的动作
            ctx.fillStyle = cat.color;
            ctx.fillRect(cat.x, cat.y, cat.width, cat.height); // 白色矩形代表猫咪
            ctx.fillText("Meow!", cat.x + 18, cat.y - 30);
        } else if (catAction === 'bite') {
            // 绘制猫咪咬手的动作
            ctx.fillStyle = cat.color;
            ctx.fillRect(cat.x, cat.y, cat.width, cat.height); // 白色矩形代表猫咪
            ctx.fillText("Bite!", cat.x + 26, cat.y - 30)
        } else {
            // 绘制猫咪空闲状态
            ctx.fillStyle = cat.color;
            ctx.fillRect(cat.x, cat.y, cat.width, cat.height); // 白色矩形代表猫咪
        }

        // 绘制玩家的手
        ctx.fillStyle = hand.color;
        ctx.fillRect(hand.x, hand.y, hand.width, hand.height); // 绘制手

        if (hitResult) {
            ctx.fillText(hitResult, hand.x, hand.y - 20);
        }
    }

    startGame();

    drawGame();

    // 在游戏开始时，加载指定的乐谱
    loadScore('easy');  // 你可以根据用户的选择加载不同的乐谱
});
