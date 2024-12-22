// 获取DOM元素
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const quoteInput = document.getElementById('quoteInput');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');

// 设置画布尺寸
canvas.width = 1080;
canvas.height = 1350;

// 生成当前日期
function getCurrentDate() {
    const date = new Date();
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

// 绘制光束效果
function drawLightBeams() {
    const beamCount = 8;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.save();
    ctx.globalAlpha = 0.04;
    
    for(let i = 0; i < beamCount; i++) {
        const angle = (Math.PI * 2 * i) / beamCount;
        const gradient = ctx.createLinearGradient(
            centerX,
            centerY,
            centerX + Math.cos(angle) * canvas.width,
            centerY + Math.sin(angle) * canvas.height
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle - 0.2) * canvas.width,
            centerY + Math.sin(angle - 0.2) * canvas.height
        );
        ctx.lineTo(
            centerX + Math.cos(angle + 0.2) * canvas.width,
            centerY + Math.sin(angle + 0.2) * canvas.height
        );
        ctx.closePath();
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    ctx.restore();
}

// 绘制漂浮的几何图形
function drawFloatingShapes() {
    const shapes = 12;
    ctx.save();
    ctx.globalAlpha = 0.05;
    
    for(let i = 0; i < shapes; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 20 + Math.random() * 60;
        
        ctx.beginPath();
        if(i % 3 === 0) {
            // 圆形
            ctx.arc(x, y, size/2, 0, Math.PI * 2);
        } else if(i % 3 === 1) {
            // 正方形
            ctx.rect(x - size/2, y - size/2, size, size);
        } else {
            // 六边形
            for(let j = 0; j < 6; j++) {
                const angle = (Math.PI * 2 * j) / 6;
                const px = x + Math.cos(angle) * size/2;
                const py = y + Math.sin(angle) * size/2;
                if(j === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
        }
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
    ctx.restore();
}

// 修改文字渲染函数
function drawTextWithGlow(ctx, text, x, y, fontSize) {
    // 统一使用华文行楷
    const fontFamily = `"华文行楷", "STXingkai", sans-serif`;
    
    // 外发光效果（调整以适应行楷字体）
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 25;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.font = `normal ${fontSize}px ${fontFamily}`;
    ctx.fillText(text, x, y);
    ctx.restore();

    // 内发光效果
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#ffffff';
    ctx.font = `normal ${fontSize}px ${fontFamily}`;
    ctx.fillText(text, x, y);
    ctx.restore();

    // 主文字
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = `normal ${fontSize}px ${fontFamily}`;
    ctx.fillText(text, x, y);
    ctx.restore();
}

// 修改日期和装饰的绘制
function drawDateAndDecoration(colors) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 150;

    // 绘制日期
    ctx.save();
    ctx.font = '32px "PingFang SC"';
    ctx.fillStyle = colors.date || colors.decoration;
    ctx.textAlign = 'center';
    ctx.fillText(getCurrentDate(), centerX, canvas.height - 120);
    ctx.restore();

    // 绘制装饰线
    ctx.save();
    ctx.strokeStyle = colors.decoration;
    ctx.lineWidth = 1;
    
    // 上部装饰线（水墨笔触效果）
    const lineGradient = ctx.createLinearGradient(
        centerX - 150, canvas.height - 180,
        centerX + 150, canvas.height - 180
    );
    lineGradient.addColorStop(0, 'rgba(51, 51, 51, 0)');
    lineGradient.addColorStop(0.5, 'rgba(51, 51, 51, 0.3)');
    lineGradient.addColorStop(1, 'rgba(51, 51, 51, 0)');
    
    ctx.strokeStyle = lineGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - 150, canvas.height - 180);
    ctx.lineTo(centerX + 150, canvas.height - 180);
    ctx.stroke();

    // 下部装饰线
    ctx.beginPath();
    ctx.moveTo(centerX - 100, canvas.height - 60);
    ctx.lineTo(centerX + 100, canvas.height - 60);
    ctx.stroke();
    ctx.restore();

    // 添加水印
    ctx.save();
    ctx.font = '26px "PingFang SC"';
    ctx.fillStyle = colors.watermark || colors.decoration;
    ctx.fillText('— 金句卡片 —', centerX, canvas.height - 90);
    ctx.restore();
}

// 修改 processText 函数，添加安全区域检查
function processText(text, maxWidth) {
    let lines = [];
    let fontSize;

    // 对联类型的句子模式
    const parallelPatterns = [
        {
            // 标准对仗（如：少壮不努力，老大徒��悲）
            test: (text) => /^(.+不.+)[，,](.+徒.+)$/.test(text),
            split: (text) => {
                const parts = text.split(/[，,]/);
                return [parts[0], parts[1]];
            }
        },
        {
            // 天地对仗（如：天行健，君子以自强不息）
            test: (text) => /^(天.+)[，,](.+)$/.test(text) || /^(地.+)[，,](.+)$/.test(text),
            split: (text) => {
                const parts = text.split(/[，,]/);
                return [parts[0], parts[1]];
            }
        },
        {
            // 四字对仗（如：海阔凭鱼跃，天高任鸟飞）
            test: (text) => {
                const parts = text.split(/[，,]/);
                return parts.length === 2 && parts[0].length === 4 && parts[1].length === 4;
            },
            split: (text) => text.split(/[，,]/)
        }
    ];

    // 先检查是否有标点符号
    if (text.includes('，') || text.includes(',')) {
        // 尝试匹配对仗模式
        for (const pattern of parallelPatterns) {
            if (pattern.test(text)) {
                lines = pattern.split(text);
                break;
            }
        }

        // 如果没有匹配到对仗模式，按标点符号分行
        if (lines.length === 0) {
            lines = text.split(/[，,]/).filter(line => line.trim());
        }
    } else {
        // 无标点符号时的处理
        if (text.length <= 8) {
            // 短句保持一行
            lines = [text];
        } else {
            // 尝试识别对仗结构
            const midPoint = Math.floor(text.length / 2);
            const firstHalf = text.slice(0, midPoint);
            const secondHalf = text.slice(midPoint);

            // 检查是否包含对仗关系（如：不-徒，有-无，天-地等）
            if ((firstHalf.includes('不') && secondHalf.includes('徒')) ||
                (firstHalf.includes('天') && secondHalf.includes('地')) ||
                (firstHalf.length === secondHalf.length)) {
                lines = [firstHalf, secondHalf];
            } else {
                // 尝试在语义单位处分行（如：四字一组）
                const units = text.match(/.{4}/g) || [];
                if (units.length >= 2) {
                    const breakPoint = Math.floor(units.length / 2) * 4;
                    lines = [
                        text.slice(0, breakPoint),
                        text.slice(breakPoint)
                    ];
                } else {
                    lines = [text];
                }
            }
        }
    }

    // 计算初始字体大小
    fontSize = calculateInitialFontSize(text, lines.length);

    // 添加安全区域检查和自适应调整
    const adjustTextSize = () => {
        let maxTextWidth;
        let totalTextHeight;
        const minFontSize = 80;  // 最小字号
        const maxSafeHeight = canvas.height * 0.7;  // 最大可用高度（留出30%空间）
        const verticalPadding = canvas.height * 0.15;  // 上下边距各15%

        do {
            ctx.font = `normal ${fontSize}px "华文行楷", "STXingkai", sans-serif`;
            
            // 检查每行宽度
            maxTextWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
            
            // 计算总高度
            const lineHeight = fontSize * 1.5;
            totalTextHeight = lines.length * lineHeight;

            // 如果文字太大或太高，减小字号
            if (maxTextWidth > maxWidth * 0.9 || totalTextHeight > maxSafeHeight) {
                fontSize -= 10;
            }
        } while ((maxTextWidth > maxWidth * 0.9 || totalTextHeight > maxSafeHeight) && fontSize > minFontSize);

        // 确保文字不会太靠近顶部或底部
        const totalHeight = lines.length * (fontSize * 1.5);
        if (totalHeight > canvas.height - verticalPadding * 2) {
            fontSize = Math.floor((canvas.height - verticalPadding * 2) / (lines.length * 1.5));
        }
    };

    // 执行安全区域检查
    adjustTextSize();

    return {
        lines,
        fontSize,
        lineHeight: fontSize * 1.5
    };
}

// 添加水墨效果绘制函数
function drawInkEffect(ctx, x, y, radius, opacity) {
    ctx.save();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(0, 0, 0, ${opacity * 0.5})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// 添加水墨笔触效果
function drawInkStroke(ctx, x, y, width, height, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, `rgba(0, 0, 0, ${opacity})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
}

// 添加样式渲染器
const styleRenderers = {
    // 默认星空风格
    light: {
        drawBackground: function(ctx) {
            // 创建渐变背景
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#2c3e50');
            gradient.addColorStop(1, '#3498db');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 添加光束效果
            drawLightBeams();
            // 添加漂浮的几何图形
            drawFloatingShapes();
            // 添加星光效果
            drawStars();
        },
        drawText: function(ctx, text, x, y, fontSize) {
            drawTextWithGlow(ctx, text, x, y, fontSize);
        },
        colors: {
            text: '#ffffff',
            decoration: 'rgba(255, 255, 255, 0.8)'
        }
    },

    // 添加水墨风格
    ink: {
        drawBackground: function(ctx) {
            // 绘制宣纸底色（调整为更温和的米色）
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#f7f3eb');
            gradient.addColorStop(0.5, '#f2efe6');
            gradient.addColorStop(1, '#ece8df');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 增强宣纸纹理效果
            for (let i = 0; i < 400; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.fillStyle = `rgba(0, 0, 0, ${0.002 + Math.random() * 0.008})`;
                ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 3);
            }

            // 添加大面墨染��层）
            for (let i = 0; i < 3; i++) {
                const x = canvas.width * (0.2 + Math.random() * 0.6);
                const y = canvas.height * (0.2 + Math.random() * 0.6);
                const radius = 400 + Math.random() * 500;
                
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0.01)');
                gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.015)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // 添加中等大小的墨晕（中间层）
            for (let i = 0; i < 5; i++) {
                const x = canvas.width * (0.1 + Math.random() * 0.8);
                const y = canvas.height * (0.1 + Math.random() * 0.8);
                const radius = 200 + Math.random() * 300;
                
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0.02)');
                gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.01)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // 添加水墨笔触（前景层）
            for (let i = 0; i < 8; i++) {
                const startX = Math.random() * canvas.width;
                const startY = Math.random() * canvas.height;
                const length = 200 + Math.random() * 400;
                const angle = Math.random() * Math.PI;
                
                ctx.save();
                ctx.translate(startX, startY);
                ctx.rotate(angle);
                
                // 创建更自然的笔触效果
                const strokeGradient = ctx.createLinearGradient(0, 0, length, 0);
                strokeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                strokeGradient.addColorStop(0.2, `rgba(0, 0, 0, ${0.01 + Math.random() * 0.02})`);
                strokeGradient.addColorStop(0.5, `rgba(0, 0, 0, ${0.02 + Math.random() * 0.03})`);
                strokeGradient.addColorStop(0.8, `rgba(0, 0, 0, ${0.01 + Math.random() * 0.02})`);
                strokeGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = strokeGradient;
                ctx.fillRect(0, 0, length, 2 + Math.random() * 4);
                ctx.restore();
            }

            // 添加小墨点装饰
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = 3 + Math.random() * 8;
                
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0.03)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            // 添加水墨山水意���（远景）
            for (let i = 0; i < 3; i++) {
                const x = canvas.width * (0.1 + Math.random() * 0.8);
                const y = canvas.height * (0.6 + Math.random() * 0.3);
                const width = 300 + Math.random() * 400;
                const height = 100 + Math.random() * 200;
                
                const mountainGradient = ctx.createLinearGradient(x, y, x, y - height);
                mountainGradient.addColorStop(0, 'rgba(0, 0, 0, 0.03)');
                mountainGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = mountainGradient;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + width/2, y - height);
                ctx.lineTo(x + width, y);
                ctx.closePath();
                ctx.fill();
            }

            // 添加水墨竹叶效果（装饰）
            for (let i = 0; i < 6; i++) {
                const x = canvas.width * (0.05 + Math.random() * 0.9);
                const y = canvas.height * (0.1 + Math.random() * 0.8);
                const size = 40 + Math.random() * 60;
                const angle = -Math.PI/6 + Math.random() * Math.PI/3;
                
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);
                
                // 绘制竹叶
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(size/2, -size/8, size, 0);
                ctx.quadraticCurveTo(size/2, size/8, 0, 0);
                ctx.fillStyle = `rgba(0, 0, 0, ${0.02 + Math.random() * 0.02})`;
                ctx.fill();
                ctx.restore();
            }

            // 添加飞白效果（留白）
            for (let i = 0; i < 4; i++) {
                const x = canvas.width * (0.2 + Math.random() * 0.6);
                const y = canvas.height * (0.2 + Math.random() * 0.6);
                const size = 150 + Math.random() * 200;
                
                ctx.save();
                ctx.globalCompositeOperation = 'destination-out';
                const whiteGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
                whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = whiteGradient;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // 添加水墨点染效果
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = 2 + Math.random() * 5;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 0, 0, ${0.01 + Math.random() * 0.02})`;
                ctx.fill();
            }
        },

        drawText: function(ctx, text, x, y, fontSize) {
            ctx.save();
            
            // 文字主体
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = '#333333';
            ctx.font = `normal ${fontSize}px "华文行楷", "STXingkai", sans-serif`;
            
            // 墨晕效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 4;
            ctx.fillText(text, x, y);

            // 加深文字中心
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.7;
            ctx.fillText(text, x, y);

            ctx.restore();
        },

        // 修改装饰元素颜色
        colors: {
            text: '#333333',
            decoration: 'rgba(51, 51, 51, 0.4)',
            date: 'rgba(51, 51, 51, 0.6)',
            watermark: 'rgba(51, 51, 51, 0.3)'
        }
    },

    // 添加简约风格
    simple: {
        drawBackground: function(ctx) {
            // 主背景色
            ctx.fillStyle = '#8e44ad';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 随机决定渐变形状的位置（左上、右上、左下、右下）
            const position = Math.floor(Math.random() * 4);
            
            ctx.save();
            ctx.beginPath();
            
            switch(position) {
                case 0: // 左上
                    this.drawGradientShape(ctx, 0, 0, 'left-top');
                    break;
                case 1: // 右上
                    this.drawGradientShape(ctx, canvas.width, 0, 'right-top');
                    break;
                case 2: // 左下
                    this.drawGradientShape(ctx, 0, canvas.height, 'left-bottom');
                    break;
                case 3: // 右下
                    this.drawGradientShape(ctx, canvas.width, canvas.height, 'right-bottom');
                    break;
            }

            // 添加装饰元素
            this.drawDecorations(ctx, position);
            
            ctx.restore();
        },

        // 绘制渐变形状
        drawGradientShape: function(ctx, anchorX, anchorY, position) {
            // 随机生成形状大小（在合理范围内变化）
            const width = canvas.width * (0.5 + Math.random() * 0.3);  // 宽度在50%-80%之间
            const height = canvas.height * (0.5 + Math.random() * 0.3); // 高度在50%-80%之间
            
            // 随机生成曲线控制点的偏移量
            const controlOffset = Math.random() * 0.3 + 0.5; // 控制点偏移在50%-80%之间
            
            ctx.beginPath();
            
            if (position === 'left-top') {
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(
                    width * controlOffset, 0,
                    width * (controlOffset - 0.1), height * 0.6,
                    0, height * (0.7 + Math.random() * 0.3)
                );
            } else if (position === 'right-top') {
                ctx.moveTo(canvas.width, 0);
                ctx.bezierCurveTo(
                    canvas.width - width * controlOffset, 0,
                    canvas.width - width * (controlOffset - 0.1), height * 0.6,
                    canvas.width, height * (0.7 + Math.random() * 0.3)
                );
            } else if (position === 'left-bottom') {
                ctx.moveTo(0, canvas.height);
                ctx.bezierCurveTo(
                    width * controlOffset, canvas.height,
                    width * (controlOffset - 0.1), canvas.height - height * 0.6,
                    0, canvas.height - height * (0.7 + Math.random() * 0.3)
                );
            } else {
                ctx.moveTo(canvas.width, canvas.height);
                ctx.bezierCurveTo(
                    canvas.width - width * controlOffset, canvas.height,
                    canvas.width - width * (controlOffset - 0.1), canvas.height - height * 0.6,
                    canvas.width, canvas.height - height * (0.7 + Math.random() * 0.3)
                );
            }
            
            ctx.closePath();
            
            // 随机调整渐变的起止点
            const gradientStart = Math.random() * 0.2; // 0-20%的随机点
            const gradientEnd = 0.8 + Math.random() * 0.2; // 80-100%的随机终点
            
            const gradient = ctx.createLinearGradient(
                anchorX, anchorY,
                position.includes('left') ? width : canvas.width - width,
                position.includes('top') ? height : canvas.height - height
            );
            gradient.addColorStop(gradientStart, '#9b59b6');
            gradient.addColorStop(gradientEnd, '#8e44ad');
            ctx.fillStyle = gradient;
            ctx.fill();
        },

        // 绘制装饰元素
        drawDecorations: function(ctx, mainPosition) {
            // 1. 添加几何装饰组
            const drawGeometricGroup = () => {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1;
                
                // 位置基于mainPosition
                const baseX = mainPosition % 2 === 0 ? 80 : canvas.width - 200;
                const baseY = mainPosition < 2 ? 80 : canvas.height - 200;
                
                // 绘制三角形组合
                for (let i = 0; i < 3; i++) {
                    const size = 40 - i * 8;
                    ctx.beginPath();
                    ctx.moveTo(baseX + i * 15, baseY + i * 15);
                    ctx.lineTo(baseX + size + i * 15, baseY + i * 15);
                    ctx.lineTo(baseX + size/2 + i * 15, baseY - size + i * 15);
                    ctx.closePath();
                    ctx.stroke();
                }
            };

            // 2. 添加装饰性线条组
            const drawLinePattern = () => {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                
                // 在对角添加渐变线条组
                const startX = mainPosition % 2 === 0 ? 100 : canvas.width - 300;
                const startY = mainPosition < 2 ? canvas.height - 300 : 100;
                
                for (let i = 0; i < 5; i++) {
                    const length = 150 - i * 20;
                    ctx.beginPath();
                    ctx.moveTo(startX + i * 20, startY);
                    ctx.lineTo(startX + i * 20 + length, startY);
                    ctx.stroke();
                }
                ctx.restore();
            };

            // 3. 添加点阵装饰
            const drawDotMatrix = () => {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                
                const cols = 4;
                const rows = 4;
                const spacing = 15;
                const startX = mainPosition % 2 === 0 ? canvas.width - 150 : 50;
                const startY = mainPosition < 2 ? canvas.height - 150 : 50;
                
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        if ((i + j) % 2 === 0) {
                            ctx.beginPath();
                            ctx.arc(startX + j * spacing, startY + i * spacing, 2, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
                ctx.restore();
            };

            // 4. 添加装饰性曲线
            const drawDecorativeCurves = () => {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = 100;
                
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius + i * 20, Math.PI * 0.5, Math.PI * 1.5);
                    ctx.stroke();
                }
                ctx.restore();
            };

            // 5. 添加极简装饰框
            const drawMinimalistFrame = () => {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = 1;
                
                const margin = 50;
                const cornerSize = 30;
                
                // 只绘制四个角
                // 左上角
                ctx.beginPath();
                ctx.moveTo(margin, margin + cornerSize);
                ctx.lineTo(margin, margin);
                ctx.lineTo(margin + cornerSize, margin);
                ctx.stroke();
                
                // 右上角
                ctx.beginPath();
                ctx.moveTo(canvas.width - margin - cornerSize, margin);
                ctx.lineTo(canvas.width - margin, margin);
                ctx.lineTo(canvas.width - margin, margin + cornerSize);
                ctx.stroke();
                
                // 左下角
                ctx.beginPath();
                ctx.moveTo(margin, canvas.height - margin - cornerSize);
                ctx.lineTo(margin, canvas.height - margin);
                ctx.lineTo(margin + cornerSize, canvas.height - margin);
                ctx.stroke();
                
                // 右下角
                ctx.beginPath();
                ctx.moveTo(canvas.width - margin - cornerSize, canvas.height - margin);
                ctx.lineTo(canvas.width - margin, canvas.height - margin);
                ctx.lineTo(canvas.width - margin, canvas.height - margin - cornerSize);
                ctx.stroke();
                
                ctx.restore();
            };

            // 执行所有装饰绘制
            drawMinimalistFrame();
            drawGeometricGroup();
            drawLinePattern();
            drawDotMatrix();
            drawDecorativeCurves();
        },

        drawText: function(ctx, text, x, y, fontSize) {
            ctx.save();
            
            // 文字主体
            ctx.fillStyle = '#ffffff';
            ctx.font = `normal ${fontSize}px "华文行楷", "STXingkai", sans-serif`;
            
            // 不使用阴影，保持简洁
            ctx.fillText(text, x, y);

            ctx.restore();
        },

        colors: {
            text: '#ffffff',
            decoration: 'rgba(255, 255, 255, 0.7)',
            date: 'rgba(255, 255, 255, 0.8)',
            watermark: 'rgba(255, 255, 255, 0.5)'
        }
    }
};

// 添加一个变量来存储当前风格
let currentStyleName = 'light'; // 默认使用光影艺术风格

// 修改 getCurrentStyle 函数
function getCurrentStyle() {
    return styleRenderers[currentStyleName];
}

// 更新风格切换函数
function switchStyle(styleName) {
    if (styleRenderers[styleName]) {
        // 更新选中状态
        document.querySelectorAll('.style-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.style === styleName) {
                option.classList.add('active');
            }
        });
        
        currentStyleName = styleName;
        generateCard(); // 新生成卡片
    }
}

// 修改生成卡片函数
function generateCard() {
    const quote = quoteInput.value.trim();
    if (!quote) return;

    const currentStyle = getCurrentStyle();
    
    // 清空画布并绘制背景
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentStyle.drawBackground(ctx);

    // 设置基本文字样式
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 计算文本安全区域（考虑边距）
    const horizontalPadding = canvas.width * 0.15;
    const safeWidth = canvas.width - (horizontalPadding * 2);
    
    // 处理文本
    const { lines, fontSize, lineHeight } = processText(quote, safeWidth);

    // 计算文本区域
    const totalHeight = lines.length * lineHeight;
    const quoteHeight = fontSize * 1.5; // 引号大小
    const quoteDistance = fontSize * 1.2; // 引号与文字的距离（调整为1.2倍字号）
    
    // 计算整体内容的高度（包含引号）
    const contentHeight = totalHeight + quoteDistance * 2;
    
    // 计算文本起始位置（整体居中）
    const startY = (canvas.height - contentHeight) / 2;

    // 计算文本区域的边界
    const textAreaWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    const textLeft = (canvas.width - textAreaWidth) / 2;
    const textRight = textLeft + textAreaWidth;

    // 计算引号位置（基于文本区域）
    const leftQuoteX = textLeft - quoteDistance;
    const rightQuoteX = textRight + quoteDistance - quoteHeight;

    // 绘制上引号
    ctx.save();
    ctx.font = `normal ${quoteHeight}px "华文行楷", "STXingkai", sans-serif`;
    ctx.fillStyle = currentStyle.colors.text;
    ctx.textAlign = 'left';
    ctx.fillText('『', leftQuoteX, startY + quoteHeight/2);
    ctx.restore();

    // 绘制主文字
    lines.forEach((line, index) => {
        const y = startY + quoteDistance + (index * lineHeight) + (lineHeight / 2);
        currentStyle.drawText(ctx, line, canvas.width / 2, y, fontSize);
    });

    // 绘制下引号
    ctx.save();
    ctx.font = `normal ${quoteHeight}px "华文行楷", "STXingkai", sans-serif`;
    ctx.fillStyle = currentStyle.colors.text;
    ctx.textAlign = 'left';
    ctx.fillText('』', rightQuoteX, startY + quoteDistance + totalHeight + quoteDistance - quoteHeight/2);
    ctx.restore();

    // 添加日期和装饰
    drawDateAndDecoration(currentStyle.colors);
}

// 初始化事件监听
function initializeEventListeners() {
    // 确保加载成后再生成卡片
    document.fonts.ready.then(() => {
        generateCard();
    });

    // 输入事件监听
    quoteInput.addEventListener('input', generateCard);
    generateBtn.addEventListener('click', generateCard);
    downloadBtn.addEventListener('click', downloadImage);
}

// 启动应用
initializeEventListeners();

// 下载图片
function downloadImage() {
    const link = document.createElement('a');
    link.download = `金句卡片_${getCurrentDate()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// 添加星光效果
function drawStars() {
    ctx.save();
    for(let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        const opacity = Math.random() * 0.5 + 0.3;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // 添加星光闪烁效果
        if(Math.random() > 0.5) {
            ctx.beginPath();
            ctx.moveTo(x - size * 2, y);
            ctx.lineTo(x + size * 2, y);
            ctx.moveTo(x, y - size * 2);
            ctx.lineTo(x, y + size * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }
    ctx.restore();
}

// 添加字体大小计算函数
function calculateInitialFontSize(text, lineCount) {
    const totalLength = text.length;
    if (lineCount === 1) {
        if (totalLength <= 2) return 300;     // 2字以内超大号
        if (totalLength <= 4) return 260;     // 4字以内大号
        if (totalLength <= 6) return 220;     // 6字以内中大号
        if (totalLength <= 8) return 200;     // 8字以内中号
        if (totalLength <= 12) return 180;    // 12字以内小中号
        return 160;                           // 其他情况
    }
    if (lineCount === 2) {
        if (totalLength <= 6) return 240;     // 总字数6字以内
        if (totalLength <= 10) return 200;    // 总字数10字以内
        if (totalLength <= 14) return 180;    // 总字数14字以
        return 160;                           // 其他情况
    }
    return 140; // 多行默认号
} 