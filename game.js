document.addEventListener('DOMContentLoaded', () => {
    // 获取音乐文件和 canvas 元素
    const audio = document.getElementById('backgroundMusic');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 变量来存储当前乐谱信息
    let bpm = 120; // 默认BPM
    let beatInterval = 500; // 节拍周期(ms)
    let score = []; // 存储乐谱动作
    let currentBeat = 0;
    let dodgeTime = 125;    // 闪避时间(ms)

    let gameStarted = false;    // 阻塞进程，用于开始界面

    let actionLocked = false;  // 动作锁定状态，防止连续运行时的重复触发
    let beatLockTime = 20;  // 防止重复触发时间

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
                const selectedScore = data.scores.find(score => score.name === scoreName);
                if (selectedScore) {
                    score = selectedScore.notes;
                    bpm = selectedScore.bpm;
                    beatInterval = (60 / bpm) * 10000; // 计算每个节拍的时间间隔
                    beatLockTime = beatInterval / 25;
                    console.log(`Loaded easy score with BPM: ${bpm}`);
                }
            })
            .catch(error => console.error('Error loading score:', error));
    }

    // 猫咪动作函数
    function performCatAction(action) {
        actionLocked = true;

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

    // 点击处理函数，手的闪避动作
    canvas.addEventListener('touchstart', function (e) {
        if (gameStarted) {
            if (!hand.isDodging) {
                hand.isDodging = true;  // 标记进入闪避状态
                // hitResult = "";

                // 手向下移动
                hand.y = hand.dodgeY;
                drawGame();

                // 设定延时，0.2 秒后手归位
                setTimeout(() => {
                    hand.y = hand.originalY; // 恢复原位
                    drawGame(); // 重绘游戏
                    hand.isDodging = false; // 恢复可闪避状态
                }, dodgeTime);  // 200毫秒后归位
            }
        }
    });

    // 游戏启动函数，开始根据乐谱同步猫咪的动作
    function startGame() {
        // audio.play(); // 播放音乐
        currentBeat = 1; // 重置当前节拍

        const intervalId = setInterval(() => {

            if (actionLocked) {
                return;
            }
            else {
                // 执行动作
                performCatAction(score[currentBeat]);
            }

            // 延迟解锁动作，确保动作在一段时间后可以切换
            setTimeout(() => {
                actionLocked = false;  // 解锁状态，允许下一个动作
            }, beatLockTime);  // 50ms 锁定时间，防止重复触发


            console.log("Current beat" + String(currentBeat));

            if (currentBeat < score.length - 1) {
                currentBeat++;
            } else {
                currentBeat = 0;
            }

        }, beatInterval);
    }

    // 显示开始界面
    function drawStartScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "30px Arial";
        ctx.fillStyle = "#fff";
        ctx.fillText("Tap to Start", canvas.width / 2 - 90, canvas.height / 2);
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
            ctx.fillText("Meow!", cat.x + 18, cat.y - 20);
        } else if (catAction === 'bite') {
            // 绘制猫咪咬手的动作
            ctx.fillStyle = cat.color;
            ctx.fillRect(cat.x, cat.y, cat.width, cat.height); // 白色矩形代表猫咪
            ctx.fillText("Bite!", cat.x + 26, cat.y - 20)
        } else if (catAction === 'idle') {
            // 绘制猫咪空闲状态
            ctx.fillStyle = cat.color;
            ctx.fillRect(cat.x, cat.y, cat.width, cat.height); // 白色矩形代表猫咪
            ctx.fillText("Resting...", cat.x + 12, cat.y - 20)
        }

        // 绘制玩家的手
        ctx.fillStyle = hand.color;
        ctx.fillRect(hand.x, hand.y, hand.width, hand.height); // 绘制手

        if (hitResult) {
            ctx.fillText(hitResult, hand.x, hand.y - 20);
        }
    }

    // while (!gameStarted){};

    // 首次点击开始游戏
    canvas.addEventListener('touchstart', function startFirstGame() {
        if (!gameStarted) {
            // 只有用户第一次触摸时，才播放音乐并启动游戏
            audio.play().then(() => {
                canvas.removeEventListener('touchstart', startFirstGame); // 移除开始游戏的触摸监听

                gameStarted = true;
                console.log("Music started successfully");
                loadScore('hard');  // 你可以根据用户的选择加载不同的乐谱

                drawGame();

                startGame();

                // 在游戏开始时，加载指定的乐谱

            }).catch(error => {
                console.error("Music play failed:", error);  // 捕捉播放失败的错误
            });

        }


    });

    drawStartScreen();

    // startGame();

    // drawGame();

    // // 在游戏开始时，加载指定的乐谱
    // loadScore('easy');  // 你可以根据用户的选择加载不同的乐谱
});
