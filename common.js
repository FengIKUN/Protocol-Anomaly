if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('%c[SYSTEM] Virtual network proxy injected successfully.', 'color: var(--color-string); font-weight: bold;');
            })
            .catch((error) => {
                console.error('[SYSTEM] Proxy injection failed:', error);
            });
    });
}

function switchPane(targetId, navElement) {
    document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(`pane-${targetId}`).classList.add('active');
    if (navElement) navElement.classList.add('active');

    if (targetId === 'terminal') {
        const input = document.getElementById('term-input');
        if (input) input.focus();
    }
}

let ghostTriggered = false;

function showGhostMessage(htmlContent, senderName = "Null") {
    if (ghostTriggered) return;

    const toast = document.getElementById('ghostToast');
    const msgBox = document.getElementById('ghostMessage');
    const header = toast.querySelector('.ghost-header');
    const nullComm = document.getElementById('nav-comm-null');

    msgBox.innerHTML = htmlContent;
    header.innerHTML = `&lt;${senderName}&gt; Incoming Transmission...`;

    toast.classList.add('show');
    ghostTriggered = true;

    if (nullComm) {
        nullComm.style.color = '#fff';
        nullComm.innerHTML = '<i>💬</i> Null (1 New Msg)';
    }
}

function closeGhostMessage() {
    document.getElementById('ghostToast').classList.remove('show');
    const nullComm = document.getElementById('nav-comm-null');
    if (nullComm) {
        nullComm.style.color = 'var(--color-keyword)';
        nullComm.innerHTML = '<i>👤</i> Null (Offline)';
    }
}

function initTerminal(customCommandHandler) {
    const termInput = document.getElementById('term-input');
    const termContent = document.getElementById('term-content');

    if (!termInput || !termContent) return;

    termInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const rawInput = this.value.trim();
            const wrapper = this.parentElement;

            // 打印用户输入的原始命令
            const newCmdLine = document.createElement('div');
            newCmdLine.className = 'term-line';
            newCmdLine.innerHTML = `<span class="term-prompt">root@oblivion:~$</span> ${rawInput}`;
            termContent.insertBefore(newCmdLine, wrapper);

            if (rawInput !== "") {
                // 【核心升级】：模拟真实的 Bash Tokenizer (按空格拆分命令与参数)
                // 解决之前把 "nmap -sV" 整个识别为错误命令的尴尬 bug
                const parts = rawInput.split(/\s+/);
                const cmdBase = parts[0].toLowerCase(); // 第一个词是核心命令
                const args = parts.slice(1);            // 后面的全是参数

                const responseLine = document.createElement('div');
                responseLine.className = 'term-line';

                // 全局基础命令
                if (cmdBase === 'clear') {
                    termContent.innerHTML = '';
                    termContent.appendChild(wrapper);
                } else if (cmdBase === 'whoami') {
                    responseLine.innerHTML = "researcher_77";
                    termContent.insertBefore(responseLine, wrapper);
                } else {
                    // 将拆分后的指令传给各个关卡的独立解析器
                    const customRes = customCommandHandler(rawInput, cmdBase, args);

                    if (customRes) {
                        responseLine.innerHTML = customRes;
                    } else {
                        // 真实的 Bash 报错是只报找不到第一个词
                        responseLine.innerHTML = `oblivion: command not found: ${cmdBase}`;
                    }
                    termContent.insertBefore(responseLine, wrapper);
                }
            }

            this.value = '';
            termContent.scrollTop = termContent.scrollHeight; // 滚动到底部
        }
    });
}