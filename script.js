window.onload = function () {
    const canvas = document.getElementById('IDcanvas');
    const ctx = canvas.getContext('2d');
    const timeText = document.getElementById('time');
    const startbutton = document.getElementById('startBtn');
    const bodyCountText = document.getElementById('bodyCount');
    const levelCountText = document.getElementById('level');
    
    //전역변수
    var mouseX = 0;
    var mouseY = 0;
    var player = [];
    var bodyCount = 1;
    var speedCount = 40;
    var startTime;
    var delayCount = 0;
    var appleScalar = 0;
    var level = 1;
    var apple;
    var triangle;
    var Circle;
    var crashT = 0;
    const degree = Math.PI/360.0;
    var nemoX = getRand(0,canvas.width);
    var nemoY = 0;
    var circleX = getRand(0,canvas.width);
    var circleY = canvas.height;


    //클래스
    class Apple{
        constructor(){
            this.xPos = 200;
            this.yPos = 200;
            this.color = '#FF0000';
            this.size = 20;
        }
        UpdatePosition(x,y){
            this.xPos = x;
            this.yPos = y;
        }
        draw(){
            ctx.beginPath();
            ctx.arc(this.xPos, this.yPos, this.size, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
            console.log("사과그리기");
        }
    }
    class PlayerHeadObject{
        constructor(){
            this.PlayerPosX = 100;
            this.PlayerPosY = 100;
            this.dirX=0;
            this.dirY=0;
            this.speed = 5;
            this.size = 21;
            this.color = '#00FF00';
        }
        UpdatePosition(){            
            this.dirX = mouseX - this.PlayerPosX;
            this.dirY = mouseY - this.PlayerPosY;

            let scalar = Math.sqrt((this.dirX*this.dirX) + (this.dirY*this.dirY));

            this.dirX /=scalar;
            this.dirY /=scalar;

            if(scalar>20){
                this.PlayerPosX += this.dirX*this.speed;
                this.PlayerPosY += this.dirY*this.speed;
            }
        }
        draw() {
            // 원 그리기
            ctx.beginPath();
            ctx.arc(this.PlayerPosX, this.PlayerPosY, this.size, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
        }            
    }
    class PlayerBodyObject{
        constructor(){
            this.PlayerPosX = player[0].PlayerPosX;
            this.PlayerPosY = player[0].PlayerPosY;
            this.dirX=0;
            this.dirY=0;
            this.speed = 5;
            this.size = 21;
            this.color = '#0000FF';
        }
        UpdatePosition(x,y){            
            this.dirX = x-this.PlayerPosX;
            this.dirY = y-this.PlayerPosY;
            let scalar = Math.sqrt((this.dirX*this.dirX) + (this.dirY*this.dirY));
            this.dirX /=scalar;
            this.dirY /=scalar;
            if(scalar>30){
                this.PlayerPosX += this.dirX*this.speed;
                this.PlayerPosY += this.dirY*this.speed;
            }
        }
        draw() {
            // 원 그리기
            ctx.beginPath();
            ctx.arc(this.PlayerPosX, this.PlayerPosY, this.size, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
        }            
    }

    //장애물 삼각형
    class EquilateralTriangle {
        constructor(centerX, centerY) {
            this.centerX = centerX;
            this.centerY = centerY;
            this.sideLength = 75;
            this.rotationAngle = 0;
            this.speed = 1;
        }

        draw() {
            // 정삼각형을 그리기 위한 좌표 계산
            const {centerX, centerY, sideLength, rotationAngle} = this;
            const height = sideLength * Math.sqrt(3) / 2;
            const x1 = centerX + sideLength / 2 * Math.cos(rotationAngle);
            const y1 = centerY + sideLength / 2 * Math.sin(rotationAngle);
            const x2 = centerX + sideLength / 2 * Math.cos(rotationAngle + 2/3 * Math.PI);
            const y2 = centerY + sideLength / 2 * Math.sin(rotationAngle + 2/3 * Math.PI);
            const x3 = centerX + sideLength / 2 * Math.cos(rotationAngle + 4/3 * Math.PI);
            const y3 = centerY + sideLength / 2 * Math.sin(rotationAngle + 4/3 * Math.PI);

            // 캔버스에 정삼각형 그리기
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            ctx.fillStyle = "#FF0000";
            ctx.fill();
        }

        update() {
            // 회전 각도 업데이트
            this.rotationAngle += 1*this.speed;
            if (this.centerX >= canvas.width) {
                this.centerY = getRand(0,canvas.height);
                this.centerX=0;
            }
            else this.centerX += 10*this.speed; 
        }
    }
    //장애물 네모
    class nemo {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = 30;
            this.speed = 1;
            this.color = '#FF0000';
            this.angle = 0;
        }
    
        draw(nemoX,nemoY) {
            ctx.save();
            this.angle += degree*20*this.speed;
            ctx.translate(nemoX*this.speed,nemoY*this.speed);
            ctx.rotate(this.angle);                  
            ctx.fillStyle = '#00FF00';                 
            ctx.fillRect(-this.size, -this.size, 2*this.size, 2*this.size);
            ctx.restore();
        }
    }
    //장애물 동그라미
    class circle{
        constructor(x,y){
            this.x = x;
            this.y = y;
            this.dirX;
            this.dirY;
            this.speed = 1;
            this.size = 30;
            this.color = '#000000';
        }
        draw(circleX,circleY) {
            // 원 그리기
            ctx.beginPath();
            ctx.arc(circleX, circleY, this.size, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
        }            
    }

    //실행코드
    startbutton.addEventListener('click', function () {
        player.push(new PlayerHeadObject());
        startTime = new Date().getTime();
        startbutton.style.display = 'none';
        player.push(new PlayerBodyObject());
        player.push(new PlayerBodyObject());
        apple = new Apple(100,100);
        apple.draw();
        triangle = new EquilateralTriangle(200,200);
        nemonemo = new nemo(40,40);
        Circle = new circle(200,200);
        setInterval(gameLoop, 1000/speedCount);
        setInterval(updateElapsedTime, 1000);
    })
    document.addEventListener('mousemove', onMousemove);

    //게임루프(실행시키기 위한 조건 추가)
    
    //함수
    function gameLoop() {
        delayCount++;

        // Canvas 지우기
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        apple.draw();
        player[0].UpdatePosition();
        player[0].draw();
        triangle.update();
        triangle.draw();
        nemonemo.draw(nemoX,nemoY);
        nemoY += 5;
        Circle.draw(circleX,circleY)
        circleY -=5*Circle.speed;
        if (circleY <= 0) {
            circleX = getRand(0,canvas.width);
            circleY = canvas.height;
        }
        if (nemoY >= canvas.height) {
            nemoX = getRand(0,canvas.width);
            nemoY=0;
        }
        for (let i = 1; i < player.length; i++) {
            player[i].UpdatePosition(player[i-1].PlayerPosX,player[i-1].PlayerPosY);
            player[i].draw();
        }
        culScalar(player[0].PlayerPosX,player[0].PlayerPosY,apple.xPos,apple.yPos);
        if (appleScalar < 36) {
            oneMore();
            apple.UpdatePosition(getRand(0,canvas.width),getRand(0,canvas.height));
            console.log("사과");
        }
        for (let i = 0; i < player.length; i++) {
            crashTScalar(player[i].PlayerPosX,player[i].PlayerPosY,triangle.centerX,triangle.centerY);
            if (crashT < 40) {
                console.log("뒤짐");
                alert("게임 오버");
            }
            crashTScalar(player[i].PlayerPosX,player[i].PlayerPosY,nemoX,nemoY);
            if (crashT < 40) {
                console.log("뒤짐");
                alert("게임 오버");
            }
            crashTScalar(player[i].PlayerPosX,player[i].PlayerPosY,circleX,circleY);
            if (crashT < 40) {
                console.log("뒤짐");
                alert("게임 오버");
            }
        }
    }
    
    function onMousemove(event)
    {
        mouseX = event.clientX; // 마우스 커서의 X 좌표
        mouseY = event.clientY; // 마우스 커서의 Y 좌표
    }

    document.addEventListener('mousedown', function (event) {
        console.log("빨라짐");
        for (let index = 0; index < player.length; index++) {
            player[index].speed = 10;
        }
    });   
    document.addEventListener('mouseup', function (event) {
        console.log("돌아옴");
        for (let index = 0; index < player.length; index++) {
            player[index].speed = 5;
        } 
    });
    function oneMore()
    {
        bodyCount++;
        player.push(new PlayerBodyObject());
        bodyCountText.textContent = `몸뚱이:${bodyCount}`;
        if (bodyCount%5 == 0) {
            triangle.speed += 0.1;
            nemonemo.speed += 0.1;
            Circle.speed += 0.1;
            level ++;
        }
        levelCountText.textContent = `레벨${level}`
    }
    //시간 계산
    function updateElapsedTime() {
        var currentTime = new Date().getTime();
        var elapsedTime = currentTime - startTime;
        var seconds = Math.floor(elapsedTime / 1000);
        var elapsedTimeElement = document.getElementById("time");
        elapsedTimeElement.textContent = seconds + " 초";
    }
    function getRand(min,max) {
        return Math.floor(Math.random()*(max-min+1))+min;
    }
    function culScalar(x1,y1,x2,y2) {
        var xLeng = x2-x1;
        var yLeng = y2-y1;
        appleScalar = Math.sqrt((xLeng*xLeng)+(yLeng*yLeng));
    }
    function crashTScalar(x1,y1,x2,y2) {
        var xLeng = x2-x1;
        var yLeng = y2-y1;
        crashT = Math.sqrt((xLeng*xLeng)+(yLeng*yLeng));
    }
};
//과제 후기: 누군가는 반드시 해야하는 일, 내가 굳이 그 누군가가 되야할까? 그래도 좋은 경험인 것 같다
