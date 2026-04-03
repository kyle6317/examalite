// ═══════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://hmzowbcufyobdfwdfcaw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtem93YmN1ZnlvYmRmd2RmY2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Nzk1OTQsImV4cCI6MjA5MDM1NTU5NH0.EXsVJ1vQjkPB8YgcHJjTpRvDWBzlKqI8tkD56I3eKlk';

let examData = null;
let examMetadata = null;
let currentMode = 'learning'; // 'learning' or 'test'
let shuffleQuestions = false;
let shuffleChoices = false;

// Cached ZIP data (avoid re-downloading on retake)
let cachedZipArrayBuffer = null;

// Learning mode state
let learningQueue = [];
let learningIndex = 0;
let learningAnswered = new Set();
let learningCorrectSet = new Set();
let learningFirstTryCorrect = 0;
let learningStartTime = null;

// Test mode state
let testAnswers = {};
let testStartTime = null;
let timerInterval = null;
let duration_minutes = null;
let currentTestQuestions = null; // Store prepared questions to avoid re-preparing

// Question mapping (handles shuffled questions)
let questionIdToOriginal = {};
let originalToShuffled = {};

// Group stats collapse state
let groupStatsExpanded = false;
let groupStatsCount = 0;

// Custom dialog state
let dialogResolve = null;

// ═══════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const examUuid = urlParams.get('uuid');
    
    if (!examUuid) {
        showError('Không tìm thấy mã bài kiểm tra trong URL.');
        return;
    }
    
    // Scroll to top button
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('scrollToTop');
        if (window.scrollY > 300) {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
            btn.style.transform = 'translateY(0)';
        } else {
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
            btn.style.transform = 'translateY(16px)';
        }
    });
    
    await fetchExamMetadata(examUuid);
});

// ═══════════════════════════════════════════════════════════════════
// CUSTOM DIALOG (replaces confirm/alert)
// ═══════════════════════════════════════════════════════════════════

function showCustomDialog({ title, message, icon, buttons }) {
    return new Promise(resolve => {
        dialogResolve = resolve;
        const dialog = document.getElementById('customDialog');
        const iconEl = document.getElementById('dialogIcon');
        const titleEl = document.getElementById('dialogTitle');
        const msgEl = document.getElementById('dialogMessage');
        const btnsEl = document.getElementById('dialogButtons');
        
        titleEl.textContent = title || '';
        msgEl.textContent = message || '';
        
        // Icon
        if (icon === 'warning') {
            iconEl.className = 'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-warning-50';
            iconEl.innerHTML = '<svg class="w-6 h-6 text-warning-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        } else if (icon === 'question') {
            iconEl.className = 'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-accent-50';
            iconEl.innerHTML = '<svg class="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        } else if (icon === 'info') {
            iconEl.className = 'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-accent-50';
            iconEl.innerHTML = '<svg class="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        } else {
            iconEl.className = 'hidden';
            iconEl.innerHTML = '';
        }
        
        // Buttons
        btnsEl.innerHTML = '';
        (buttons || [{ label: 'OK', value: true, primary: true }]).forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.label;
            if (btn.primary) {
                button.className = 'px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-semibold transition-colors';
            } else if (btn.danger) {
                button.className = 'px-5 py-2.5 bg-danger-400 hover:bg-danger-500 text-white rounded-lg text-sm font-semibold transition-colors';
            } else {
                button.className = 'px-5 py-2.5 bg-paper-100 hover:bg-paper-200 text-ink-500 rounded-lg text-sm font-semibold transition-colors';
            }
            button.onclick = () => closeDialog(btn.value);
            btnsEl.appendChild(button);
        });
        
        dialog.classList.remove('hidden');
    });
}

function closeDialog(value) {
    const dialog = document.getElementById('customDialog');
    const overlay = dialog.querySelector('.dialog-overlay');
    const content = dialog.querySelector('.dialog-content');
    overlay.classList.add('closing');
    content.style.animation = 'fadeOut 0.15s ease-in both';
    
    setTimeout(() => {
        dialog.classList.add('hidden');
        overlay.classList.remove('closing');
        content.style.animation = '';
        if (dialogResolve) {
            dialogResolve(value);
            dialogResolve = null;
        }
    }, 150);
}

// ═══════════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

async function fetchExamMetadata(uuid) {
    try {
        updateLoadingText('Đang kiểm tra bài kiểm tra...');
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/validate-exam`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ exam_id: uuid })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể tải bài kiểm tra');
        }
        
        const data = await response.json();
        examMetadata = data;
        
        showPrepScreen();
        
    } catch (error) {
        console.error('Error fetching exam:', error);
        showError(error.message);
    }
}

async function downloadExam(signedUrl) {
    try {
        // Use cached ZIP if available
        let arrayBuffer;
        if (cachedZipArrayBuffer) {
            arrayBuffer = cachedZipArrayBuffer;
        } else {
            const response = await fetch(signedUrl);
            if (!response.ok) throw new Error('Không thể tải file ZIP');
            
            const blob = await response.blob();
            arrayBuffer = await blob.arrayBuffer();
            cachedZipArrayBuffer = arrayBuffer;
        }
        
        // Extract ZIP
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        // Read exam.json
        const examJsonFile = zip.file('exam.json');
        if (!examJsonFile) throw new Error('Không tìm thấy exam.json trong file ZIP');
        
        const examJsonText = await examJsonFile.async('text');
        examData = JSON.parse(examJsonText);
        
        // Store media files
        examData.mediaFiles = {};
        const mediaFolder = zip.folder('media');
        if (mediaFolder) {
            for (const [filename, file] of Object.entries(mediaFolder.files)) {
                if (!file.dir) {
                    const blob = await file.async('blob');
                    examData.mediaFiles[filename.replace('media/', '')] = URL.createObjectURL(blob);
                }
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error downloading exam:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN TRANSITIONS
// ═══════════════════════════════════════════════════════════════════

function updateLoadingText(text) {
    document.getElementById('loadingText').textContent = text;
}

function showError(message) {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('errorScreen').classList.remove('hidden');
    document.getElementById('errorScreen').classList.add('flex');
    document.getElementById('errorMessage').textContent = message;
}

function showPrepScreen() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('prepScreen').classList.remove('hidden');
    
    document.getElementById('examTitle').textContent = examMetadata.title || 'Bài kiểm tra';
    document.getElementById('examDescription').textContent = examMetadata.description || '';
    
    const durationText = examMetadata.duration_minutes 
        ? `${examMetadata.duration_minutes} phút` 
        : 'Không giới hạn';
    document.getElementById('examDuration').textContent = durationText;
    
    document.getElementById('totalQuestions').textContent = '...';
    
    startDownload();
}

async function startDownload() {
    const progressContainer = document.getElementById('downloadProgress');
    const downloadBar = document.getElementById('downloadBar');
    const downloadText = document.getElementById('downloadText');
    
    // If cached, skip download animation
    if (cachedZipArrayBuffer) {
        try {
            await downloadExam(examMetadata.signed_url);
            const totalQuestions = countTotalQuestions();
            document.getElementById('totalQuestions').textContent = totalQuestions;
            document.getElementById('configSection').classList.remove('hidden');
        } catch (error) {
            showError('Không thể tải nội dung bài kiểm tra: ' + error.message);
        }
        return;
    }
    
    progressContainer.classList.remove('hidden');
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        downloadBar.style.width = progress + '%';
        downloadText.textContent = Math.round(progress) + '%';
    }, 200);
    
    try {
        await downloadExam(examMetadata.signed_url);
        
        clearInterval(progressInterval);
        downloadBar.style.width = '100%';
        downloadText.textContent = '100%';
        
        const totalQuestions = countTotalQuestions();
        document.getElementById('totalQuestions').textContent = totalQuestions;
        
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            document.getElementById('configSection').classList.remove('hidden');
        }, 500);
        
    } catch (error) {
        clearInterval(progressInterval);
        showError('Không thể tải nội dung bài kiểm tra: ' + error.message);
    }
}

function countTotalQuestions() {
    let count = 0;
    if (examData && examData.groups) {
        examData.groups.forEach(group => {
            count += group.questions.length;
        });
    }
    return count;
}

// ═══════════════════════════════════════════════════════════════════
// MODE TOGGLE (FIXED: labels are swapped in HTML, logic stays same)
// ═══════════════════════════════════════════════════════════════════

function toggleMode() {
    const toggle = document.getElementById('modeToggle');
    const circle = document.getElementById('modeToggleCircle');
    
    if (currentMode === 'learning') {
        currentMode = 'test';
        toggle.classList.remove('bg-accent-500');
        toggle.classList.add('bg-ink-300');
        circle.classList.remove('translate-x-6');
        circle.classList.add('translate-x-1');
    } else {
        currentMode = 'learning';
        toggle.classList.remove('bg-ink-300');
        toggle.classList.add('bg-accent-500');
        circle.classList.remove('translate-x-1');
        circle.classList.add('translate-x-6');
    }
}

function startExam() {
    shuffleQuestions = document.getElementById('shuffleQuestions').checked;
    shuffleChoices = document.getElementById('shuffleChoices').checked;
    duration_minutes = examMetadata.duration_minutes;
    
    prepareQuestions();
    
    if (currentMode === 'learning') {
        startLearningMode();
    } else {
        startTestMode();
    }
}

// ═══════════════════════════════════════════════════════════════════
// QUESTION PREPARATION & SHUFFLING
// ═══════════════════════════════════════════════════════════════════

function prepareQuestions() {
    questionIdToOriginal = {};
    originalToShuffled = {};
    
    let allQuestions = [];
    
    if (shuffleQuestions) {
        const shuffledGroups = [...examData.groups].sort(() => Math.random() - 0.5);
        
        shuffledGroups.forEach(group => {
            const shuffledQuestions = [...group.questions].sort(() => Math.random() - 0.5);
            
            shuffledQuestions.forEach(q => {
                const newId = 'q_' + Math.random().toString(36).substr(2, 9);
                questionIdToOriginal[newId] = {
                    originalId: q.id,
                    groupId: group.id,
                    question: q,
                    group: group
                };
                originalToShuffled[q.id] = newId;
                allQuestions.push({ ...q, id: newId, groupId: group.id, group: group });
            });
        });
    } else {
        examData.groups.forEach(group => {
            group.questions.forEach(q => {
                const newId = 'q_' + Math.random().toString(36).substr(2, 9);
                questionIdToOriginal[newId] = {
                    originalId: q.id,
                    groupId: group.id,
                    question: q,
                    group: group
                };
                originalToShuffled[q.id] = newId;
                allQuestions.push({ ...q, id: newId, groupId: group.id, group: group });
            });
        });
    }
    
    if (shuffleChoices) {
        allQuestions.forEach(q => {
            if (q.choices && q.choices.length > 0 && q.type !== 'true_false') {
                q.choices = [...q.choices].sort(() => Math.random() - 0.5);
            }
        });
    }
    
    return allQuestions;
}

// ═══════════════════════════════════════════════════════════════════
// LEARNING MODE
// ═══════════════════════════════════════════════════════════════════

function startLearningMode() {
    learningQueue = prepareQuestions();
    learningIndex = 0;
    learningAnswered = new Set();
    learningCorrectSet = new Set();
    learningFirstTryCorrect = 0;
    learningStartTime = Date.now();
    
    document.getElementById('prepScreen').classList.add('hidden');
    document.getElementById('learningScreen').classList.remove('hidden');
    
    loadSavedAnswers('learning');
    renderLearningQuestion();
}

function renderLearningQuestion() {
    if (learningIndex >= learningQueue.length) {
        showLearningResults();
        return;
    }
    
    const q = learningQueue[learningIndex];
    const qData = questionIdToOriginal[q.id];
    const group = qData.group;
    
    // FIXED: Progress only shows correct count
    const total = countTotalQuestions();
    document.getElementById('learningProgress').textContent = `${learningCorrectSet.size} / ${total} đúng`;
    
    const progressPercent = (learningCorrectSet.size / total) * 100;
    document.getElementById('learningProgressBar').style.width = progressPercent + '%';
    
    // Build question HTML
    let html = '<div class="fade-in">';
    
    // Group label and context
    if (group.label || group.context) {
        html += '<div class="mb-6 pb-6 border-b border-paper-200">';
        if (group.label) {
            html += `<div class="text-sm font-semibold text-ink-400 mb-2">${escapeHtml(group.label)}</div>`;
        }
        if (group.context) {
            html += `<div class="text-base text-ink-500 prose prose-sm max-w-none">${marked.parse(group.context)}</div>`;
        }
        if (group.context_media && group.context_media.length > 0) {
            html += renderMedia(group.context_media);
        }
        html += '</div>';
    }
    
    // Question prompt
    html += `<div class="text-lg font-semibold text-ink-600 mb-4">${marked.parse(q.prompt)}</div>`;
    
    if (q.prompt_media && q.prompt_media.length > 0) {
        html += renderMedia(q.prompt_media);
    }
    
    // Answer section
    html += `<div id="answerSection">`;
    html += renderQuestionChoices(q, 'learning');
    html += `</div>`;
    
    // Buttons area (stays in fixed position)
    html += `<div id="learningBtnArea" class="mt-6">
        <button id="confirmBtn" onclick="checkLearningAnswer()" class="w-full bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-lg font-semibold transition-colors">
            Xác nhận
        </button>
    </div>`;
    
    // Feedback area (BELOW buttons)
    html += `<div id="learningFeedback"></div>`;
    
    html += '</div>';
    
    document.getElementById('learningQuestion').innerHTML = html;
}

function checkLearningAnswer() {
    const q = learningQueue[learningIndex];
    const userAnswer = getUserAnswer(q.id, 'learning');
    const isCorrect = checkAnswer(q, userAnswer);
    
    // Mark as answered if first time
    if (!learningAnswered.has(q.id)) {
        learningAnswered.add(q.id);
        if (isCorrect) {
            learningFirstTryCorrect++;
        }
    }
    if (isCorrect) {
        learningCorrectSet.add(q.id);
    }
    
    showLearningResult(q, userAnswer, isCorrect);
}

function showLearningResult(q, userAnswer, isCorrect) {
    const answerSection = document.getElementById('answerSection');
    const btnArea = document.getElementById('learningBtnArea');
    const feedbackArea = document.getElementById('learningFeedback');
    
    // Disable inputs
    const inputs = answerSection.querySelectorAll('input');
    inputs.forEach(input => input.disabled = true);
    
    // FIXED: Feedback goes BELOW buttons
    const feedbackHtml = `
        <div class="mt-4 p-4 rounded-lg ${isCorrect ? 'bg-success-50 border border-success-200' : 'bg-danger-50 border border-danger-200'} fade-in">
            <div class="flex items-center gap-2 mb-2">
                ${isCorrect 
                    ? '<svg class="w-5 h-5 text-success-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
                    : '<svg class="w-5 h-5 text-danger-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
                }
                <span class="font-semibold ${isCorrect ? 'text-success-500' : 'text-danger-500'}">
                    ${isCorrect ? 'Chính xác!' : 'Chưa chính xác'}
                </span>
            </div>
            ${!isCorrect ? `<div class="text-sm text-ink-500">Đáp án đúng: ${formatCorrectAnswer(q)}</div>` : ''}
        </div>
    `;
    
    feedbackArea.innerHTML = feedbackHtml;
    
    // Update button text
    if (isCorrect) {
        btnArea.innerHTML = `<button onclick="nextLearningQuestion()" class="w-full bg-success-300 hover:bg-success-400 text-white py-3 rounded-lg font-semibold transition-colors">Câu tiếp theo</button>`;
    } else {
        btnArea.innerHTML = `<button onclick="requeueQuestion()" class="w-full bg-warning-300 hover:bg-warning-400 text-white py-3 rounded-lg font-semibold transition-colors">Thử lại sau</button>`;
    }
    
    // Update progress bar
    const total = countTotalQuestions();
    document.getElementById('learningProgress').textContent = `${learningCorrectSet.size} / ${total} đúng`;
    const progressPercent = (learningCorrectSet.size / total) * 100;
    document.getElementById('learningProgressBar').style.width = progressPercent + '%';
}

function nextLearningQuestion() {
    learningIndex++;
    renderLearningQuestion();
}

function requeueQuestion() {
    const q = learningQueue[learningIndex];
    learningQueue.splice(learningIndex, 1);
    
    if (shuffleQuestions) {
        const insertPos = learningIndex + Math.floor(Math.random() * (learningQueue.length - learningIndex + 1));
        learningQueue.splice(insertPos, 0, q);
    } else {
        learningQueue.push(q);
    }
    
    renderLearningQuestion();
}

function showLearningResults() {
    const totalTime = Math.floor((Date.now() - learningStartTime) / 1000);
    const totalQuestions = countTotalQuestions();
    const retryCount = learningAnswered.size - learningFirstTryCorrect;
    
    const html = `
        <div class="fade-in text-center">
            <div class="w-20 h-20 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-success-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            </div>
            <h2 class="font-serif text-3xl font-bold text-ink-600 mb-6">Hoàn thành!</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                <div class="p-4 bg-paper-50 rounded-lg">
                    <div class="text-3xl font-bold text-ink-600">${totalQuestions}</div>
                    <div class="text-sm text-ink-300">Tổng số câu</div>
                </div>
                <div class="p-4 bg-success-50 rounded-lg">
                    <div class="text-3xl font-bold text-success-300">${learningFirstTryCorrect}</div>
                    <div class="text-sm text-ink-300">Đúng lần đầu</div>
                </div>
                <div class="p-4 bg-warning-50 rounded-lg">
                    <div class="text-3xl font-bold text-warning-300">${retryCount}</div>
                    <div class="text-sm text-ink-300">Cần thử lại</div>
                </div>
            </div>
            
            <div class="p-4 bg-paper-50 rounded-lg max-w-xs mx-auto mb-6">
                <div class="text-sm text-ink-300 mb-1">Thời gian hoàn thành</div>
                <div class="text-2xl font-bold text-ink-600">${formatTime(totalTime)}</div>
            </div>
            
            <button onclick="retakeExam()" class="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Làm lại
            </button>
        </div>
    `;
    
    document.getElementById('learningQuestion').innerHTML = html;
    clearSavedAnswers('learning');
}

async function quitLearning() {
    const result = await showCustomDialog({
        title: 'Thoát chế độ học tập?',
        message: 'Tiến trình sẽ không được lưu.',
        icon: 'warning',
        buttons: [
            { label: 'Hủy', value: false },
            { label: 'Thoát', value: true, danger: true }
        ]
    });
    
    if (result) {
        // Go back to prep screen
        document.getElementById('learningScreen').classList.add('hidden');
        document.getElementById('prepScreen').classList.remove('hidden');
    }
}

// ═══════════════════════════════════════════════════════════════════
// TEST MODE
// ═══════════════════════════════════════════════════════════════════

function startTestMode() {
    const questions = prepareQuestions();
    currentTestQuestions = questions; // FIXED: store for grading later
    testAnswers = {};
    testStartTime = Date.now();
    
    document.getElementById('prepScreen').classList.add('hidden');
    document.getElementById('testScreen').classList.remove('hidden');
    
    document.getElementById('sidebarTitle').textContent = examMetadata.title || 'Bài kiểm tra';
    
    // Set mobile title
    const mobileTitle = document.getElementById('mobileExamTitle');
    if (mobileTitle) {
        mobileTitle.textContent = examMetadata.title || 'Bài kiểm tra';
    }
    
    loadSavedAnswers('test');
    renderTestQuestions(questions);
    renderQuestionMap(questions);
    startTimer();
}

function renderTestQuestions(questions) {
    let html = '';
    
    questions.forEach((q, index) => {
        const qData = questionIdToOriginal[q.id];
        const group = qData.group;
        
        html += `<div id="question-${q.id}" class="bg-white rounded-xl shadow-[0_3px_8px_0_rgba(58,55,49,0.10),0_1px_3px_-1px_rgba(58,55,49,0.08)] p-6 md:p-8 mb-6 scroll-mt-24">`;
        
        // Question number
        html += `<div class="flex items-center gap-3 mb-4 pb-4 border-b border-paper-200">`;
        html += `<div class="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center font-bold text-accent-600">${index + 1}</div>`;
        html += `<div class="text-xs font-semibold text-ink-300 uppercase tracking-wide">${getQuestionTypeLabel(q.type)}</div>`;
        html += `</div>`;
        
        // Group context
        if (group.label || group.context) {
            html += '<div class="mb-6 pb-6 border-b border-paper-200">';
            if (group.label) {
                html += `<div class="text-sm font-semibold text-ink-400 mb-2">${escapeHtml(group.label)}</div>`;
            }
            if (group.context) {
                html += `<div class="prose prose-sm max-w-none">${marked.parse(group.context)}</div>`;
            }
            if (group.context_media && group.context_media.length > 0) {
                html += renderMedia(group.context_media);
            }
            html += '</div>';
        }
        
        // Question
        html += `<div class="text-lg font-semibold text-ink-600 mb-4">${marked.parse(q.prompt)}</div>`;
        
        if (q.prompt_media && q.prompt_media.length > 0) {
            html += renderMedia(q.prompt_media);
        }
        
        // Choices
        html += renderQuestionChoices(q, 'test');
        
        html += '</div>';
    });
    
    document.getElementById('testQuestions').innerHTML = html;
}

function renderQuestionMap(questions) {
    let html = '';
    
    questions.forEach((q, index) => {
        const answered = testAnswers[q.id] !== undefined;
        const bubbleClass = answered 
            ? 'bg-accent-100 border-accent-200 text-accent-600' 
            : 'bg-white border-paper-300 text-ink-400';
        
        html += `
            <button 
                id="bubble-${q.id}"
                onclick="scrollToQuestion('${q.id}')" 
                class="w-10 h-10 rounded-lg border-2 ${bubbleClass} font-semibold text-sm transition-colors hover:border-accent-300"
            >
                ${index + 1}
            </button>
        `;
    });
    
    document.getElementById('questionMap').innerHTML = html;
    document.getElementById('mobileQuestionMap').innerHTML = html;
    document.getElementById('mobileQuestionMapFull').innerHTML = html;
}

function scrollToQuestion(questionId) {
    const element = document.getElementById('question-' + questionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    const mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenu.classList.contains('hidden')) {
        toggleMobileMenu();
    }
}

function updateQuestionBubble(questionId) {
    // Update all 3 copies of the bubble
    const ids = ['bubble-' + questionId];
    document.querySelectorAll(`[id="bubble-${questionId}"]`).forEach(bubble => {
        bubble.classList.remove('bg-white', 'border-paper-300', 'text-ink-400');
        bubble.classList.add('bg-accent-100', 'border-accent-200', 'text-accent-600');
    });
}

function startTimer() {
    if (duration_minutes) {
        let timeLeft = duration_minutes * 60;
        
        // Show initial time
        updateTimerDisplay(timeLeft, true);
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(timeLeft, true);
            
            if (timeLeft <= 300 && timeLeft > 0) {
                document.getElementById('timerSection').classList.add('timer-warning');
                document.getElementById('timer').classList.add('text-warning-300');
            }
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                gradeTest();
            }
        }, 1000);
    } else {
        let elapsed = 0;
        
        timerInterval = setInterval(() => {
            elapsed++;
            updateTimerDisplay(elapsed, false);
        }, 1000);
    }
}

function updateTimerDisplay(totalSeconds, isCountdown) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    document.getElementById('timer').textContent = timeStr;
    document.getElementById('mobileTimer').textContent = timeStr;
    document.getElementById('mobileTimerFull').textContent = timeStr;
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

async function submitTest() {
    clearInterval(timerInterval);
    
    const answeredCount = Object.keys(testAnswers).length;
    const totalCount = countTotalQuestions();
    const unanswered = totalCount - answeredCount;
    
    let message = 'Bạn có chắc chắn muốn nộp bài?';
    if (unanswered > 0) {
        message += ` Bạn còn ${unanswered} câu chưa trả lời.`;
    }
    
    const result = await showCustomDialog({
        title: 'Nộp bài',
        message: message,
        icon: 'question',
        buttons: [
            { label: 'Tiếp tục làm', value: false },
            { label: 'Nộp bài', value: true, primary: true }
        ]
    });
    
    if (!result) {
        // Resume timer
        if (duration_minutes) {
            startTimer();
        }
        return;
    }
    
    gradeTest();
}

function gradeTest() {
    // FIXED: use stored questions instead of calling prepareQuestions() again
    const questions = currentTestQuestions;
    let correct = 0;
    let wrong = 0;
    const results = [];
    
    questions.forEach(q => {
        const userAnswer = testAnswers[q.id];
        const isCorrect = checkAnswer(q, userAnswer);
        
        if (isCorrect) {
            correct++;
        } else if (userAnswer !== undefined) {
            wrong++;
        }
        
        results.push({
            question: q,
            userAnswer: userAnswer,
            isCorrect: isCorrect
        });
    });
    
    showResults(correct, wrong, results);
}

function showResults(correct, wrong, results) {
    const total = countTotalQuestions();
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    document.getElementById('testScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    
    // Score
    document.getElementById('scorePercentage').textContent = percentage + '%';
    document.getElementById('scorePercentage').className = percentage >= 50 ? 'text-5xl font-bold mb-4 text-success-300' : 'text-5xl font-bold mb-4 text-danger-300';
    
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('wrongCount').textContent = wrong;
    document.getElementById('totalCount').textContent = total;
    
    // Icon
    const icon = document.getElementById('resultIcon');
    if (percentage >= 80) {
        icon.className = 'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-success-50';
        icon.innerHTML = '<svg class="w-10 h-10 text-success-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
    } else if (percentage >= 50) {
        icon.className = 'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-warning-50';
        icon.innerHTML = '<svg class="w-10 h-10 text-warning-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    } else {
        icon.className = 'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-danger-50';
        icon.innerHTML = '<svg class="w-10 h-10 text-danger-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
    }
    
    renderGroupStats(results);
    renderDetailedReview(results);
    
    clearSavedAnswers('test');
}

function renderGroupStats(results) {
    const groupMap = {};
    
    results.forEach(r => {
        const qData = questionIdToOriginal[r.question.id];
        const groupId = qData.groupId;
        
        if (!groupMap[groupId]) {
            groupMap[groupId] = {
                label: qData.group.label || 'Nhóm không có tên',
                correct: 0,
                total: 0
            };
        }
        
        groupMap[groupId].total++;
        if (r.isCorrect) {
            groupMap[groupId].correct++;
        }
    });
    
    const groups = Object.values(groupMap);
    groupStatsCount = groups.length;
    groupStatsExpanded = groups.length <= 3;
    
    let html = '';
    groups.forEach((group, i) => {
        const percent = Math.round((group.correct / group.total) * 100);
        const hiddenClass = (!groupStatsExpanded && i >= 3) ? 'hidden group-stat-extra' : 'group-stat-extra';
        const itemClass = i < 3 ? '' : hiddenClass;
        
        html += `
            <div class="flex items-center gap-4 mb-3 ${i >= 3 ? 'group-stat-extra' : ''}" ${!groupStatsExpanded && i >= 3 ? 'style="display:none"' : ''}>
                <div class="flex-1">
                    <div class="text-sm font-semibold text-ink-500 mb-1">${escapeHtml(group.label)}</div>
                    <div class="text-xs text-ink-300">${group.correct} / ${group.total} đúng</div>
                </div>
                <div class="text-lg font-bold ${percent >= 50 ? 'text-success-300' : 'text-danger-300'}">${percent}%</div>
            </div>
        `;
    });
    
    document.getElementById('groupStatsContent').innerHTML = html;
    
    // Show/hide toggle buttons
    const toggleBtn = document.getElementById('groupToggleBtn');
    const toggleNavBtn = document.getElementById('groupToggleNav');
    
    if (groups.length > 3) {
        toggleBtn.classList.remove('hidden');
        toggleBtn.textContent = groupStatsExpanded ? 'Thu gọn' : 'Xem thêm';
        toggleNavBtn.classList.remove('hidden');
        toggleNavBtn.textContent = groupStatsExpanded ? 'Thu gọn' : 'Xem thêm';
    } else {
        toggleBtn.classList.add('hidden');
        toggleNavBtn.classList.add('hidden');
    }
}

function toggleGroupStats() {
    groupStatsExpanded = !groupStatsExpanded;
    
    document.querySelectorAll('.group-stat-extra').forEach(el => {
        el.style.display = groupStatsExpanded ? '' : 'none';
    });
    
    const toggleBtn = document.getElementById('groupToggleBtn');
    const toggleNavBtn = document.getElementById('groupToggleNav');
    toggleBtn.textContent = groupStatsExpanded ? 'Thu gọn' : 'Xem thêm';
    toggleNavBtn.textContent = groupStatsExpanded ? 'Thu gọn' : 'Xem thêm';
}

function renderDetailedReview(results) {
    window.allResults = results;
    filterResults('all');
}

function filterResults(filter) {
    const results = window.allResults || [];
    
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-accent-500', 'text-white');
        btn.classList.add('bg-paper-100', 'text-ink-500');
    });
    
    // Find clicked button by filter value
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterMap = { 'all': 0, 'correct': 1, 'wrong': 2 };
    const idx = filterMap[filter];
    if (filterBtns[idx]) {
        filterBtns[idx].classList.remove('bg-paper-100', 'text-ink-500');
        filterBtns[idx].classList.add('bg-accent-500', 'text-white');
    }
    
    // Filter results
    let filtered = results;
    if (filter === 'correct') {
        filtered = results.filter(r => r.isCorrect);
    } else if (filter === 'wrong') {
        filtered = results.filter(r => !r.isCorrect);
    }
    
    // Render
    let html = '';
    filtered.forEach((r, index) => {
        const q = r.question;
        const qData = questionIdToOriginal[q.id];
        const group = qData.group;
        
        // Find original index
        const originalIndex = results.indexOf(r);
        
        html += `<div class="bg-white rounded-xl shadow-[0_3px_8px_0_rgba(58,55,49,0.10),0_1px_3px_-1px_rgba(58,55,49,0.08)] p-6 mb-4">`;
        
        // Header
        html += `<div class="flex items-center gap-3 mb-4 pb-4 border-b border-paper-200">`;
        html += `<div class="w-10 h-10 rounded-full ${r.isCorrect ? 'bg-success-50 text-success-300' : 'bg-danger-50 text-danger-300'} flex items-center justify-center font-bold">`;
        if (r.isCorrect) {
            html += '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        } else {
            html += '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
        }
        html += `</div>`;
        html += `<div>`;
        html += `<div class="text-xs font-semibold text-ink-300 uppercase tracking-wide">Câu ${originalIndex + 1}</div>`;
        html += `<div class="text-sm font-semibold ${r.isCorrect ? 'text-success-300' : 'text-danger-300'}">${r.isCorrect ? 'Chính xác' : (r.userAnswer !== undefined ? 'Chưa chính xác' : 'Chưa trả lời')}</div>`;
        html += `</div>`;
        html += `</div>`;
        
        // Question
        html += `<div class="prose prose-sm max-w-none mb-4">${marked.parse(q.prompt)}</div>`;
        
        // Answer
        html += `<div class="text-sm text-ink-400 mb-1">Câu trả lời của bạn:</div>`;
        html += `<div class="text-base font-semibold ${r.isCorrect ? 'text-success-500' : 'text-danger-500'} mb-2">${formatUserAnswer(q, r.userAnswer) || 'Chưa trả lời'}</div>`;
        
        if (!r.isCorrect) {
            html += `<div class="text-sm text-ink-400 mb-1">Đáp án đúng:</div>`;
            html += `<div class="text-base font-semibold text-success-500">${formatCorrectAnswer(q)}</div>`;
        }
        
        html += '</div>';
    });
    
    document.getElementById('detailedReview').innerHTML = html || '<div class="text-center text-ink-300 py-8">Không có câu hỏi nào.</div>';
}

function retakeExam() {
    // FIXED: Don't reload page, go back to prep screen using cached data
    clearInterval(timerInterval);
    
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('learningScreen').classList.add('hidden');
    document.getElementById('testScreen').classList.add('hidden');
    document.getElementById('prepScreen').classList.remove('hidden');
    
    // Reset state
    testAnswers = {};
    currentTestQuestions = null;
    learningQueue = [];
    learningIndex = 0;
    learningAnswered = new Set();
    learningCorrectSet = new Set();
    learningFirstTryCorrect = 0;
    
    // Re-parse exam data from cached ZIP
    if (cachedZipArrayBuffer) {
        startDownload();
    }
}

// ═══════════════════════════════════════════════════════════════════
// RENDERING HELPERS
// ═══════════════════════════════════════════════════════════════════

function renderQuestionChoices(q, mode) {
    let html = '';
    const prefix = mode === 'learning' ? 'learn' : 'test';
    
    switch (q.type) {
        case 'single_choice':
            q.choices.forEach(choice => {
                html += `
                    <label class="choice-item flex items-start gap-3 p-4 border-2 border-paper-200 rounded-lg cursor-pointer mb-3 hover:bg-paper-50 transition-colors">
                        <input type="radio" name="${prefix}_${q.id}" value="${choice.id}" onchange="saveAnswer('${q.id}', '${choice.id}', '${mode}')" class="mt-0.5 w-4 h-4 text-accent-500 border-paper-300">
                        <div class="flex-1 prose prose-sm max-w-none">${marked.parse(choice.text)}</div>
                    </label>
                `;
            });
            break;
            
        case 'multi_choice':
            q.choices.forEach(choice => {
                html += `
                    <label class="choice-item flex items-start gap-3 p-4 border-2 border-paper-200 rounded-lg cursor-pointer mb-3 hover:bg-paper-50 transition-colors">
                        <input type="checkbox" name="${prefix}_${q.id}" value="${choice.id}" onchange="saveMultiAnswer('${q.id}', '${mode}')" class="mt-0.5 w-4 h-4 text-accent-500 border-paper-300 rounded">
                        <div class="flex-1 prose prose-sm max-w-none">${marked.parse(choice.text)}</div>
                    </label>
                `;
            });
            break;
            
        case 'true_false':
            q.choices.forEach(choice => {
                html += `
                    <label class="choice-item flex items-center gap-3 p-4 border-2 border-paper-200 rounded-lg cursor-pointer mb-3 hover:bg-paper-50 transition-colors">
                        <input type="radio" name="${prefix}_${q.id}" value="${choice.id}" onchange="saveAnswer('${q.id}', '${choice.id}', '${mode}')" class="w-4 h-4 text-accent-500 border-paper-300">
                        <div class="flex-1 font-semibold text-ink-500">${choice.id === 'true' ? 'Đúng' : 'Sai'}</div>
                    </label>
                `;
            });
            break;
            
        case 'fill_number':
            html += `
                <input 
                    type="number" 
                    id="${prefix}_${q.id}" 
                    oninput="saveAnswer('${q.id}', this.value, '${mode}')"
                    class="w-full px-4 py-3 border-2 border-paper-200 rounded-lg focus:border-accent-500 focus:outline-none text-ink-600"
                    placeholder="Nhập số..."
                >
            `;
            break;
            
        case 'fill_text':
            html += `
                <input 
                    type="text" 
                    id="${prefix}_${q.id}"
                    oninput="saveAnswer('${q.id}', this.value, '${mode}')"
                    class="w-full px-4 py-3 border-2 border-paper-200 rounded-lg focus:border-accent-500 focus:outline-none text-ink-600"
                    placeholder="Nhập câu trả lời..."
                >
            `;
            break;
            
        case 'fill_blank':
            const blanks = (q.prompt.match(/___/g) || []).length;
            for (let i = 0; i < blanks; i++) {
                html += `
                    <div class="mb-3">
                        <label class="text-sm font-semibold text-ink-400 mb-1 block">Chỗ trống ${i + 1}</label>
                        <input 
                            type="text" 
                            data-blank-index="${i}"
                            data-question-id="${q.id}"
                            oninput="saveBlankAnswer('${q.id}', '${mode}')"
                            class="blank-input-${q.id} w-full px-4 py-3 border-2 border-paper-200 rounded-lg focus:border-accent-500 focus:outline-none text-ink-600"
                            placeholder="Nhập câu trả lời..."
                        >
                    </div>
                `;
            }
            break;
    }
    
    return html;
}

function renderMedia(mediaArray) {
    let html = '<div class="my-4 space-y-3">';
    
    mediaArray.forEach(media => {
        const src = examData.mediaFiles[media.src];
        if (!src) return;
        
        switch (media.type) {
            case 'image':
                html += `<img src="${src}" alt="${escapeHtml(media.alt || '')}" class="max-w-full rounded-lg shadow-[0_1px_3px_0_rgba(58,55,49,0.08),0_1px_2px_-1px_rgba(58,55,49,0.06)]">`;
                break;
            case 'audio':
                html += `<audio controls src="${src}" class="w-full"></audio>`;
                break;
            case 'video':
                html += `<video controls src="${src}" class="max-w-full rounded-lg shadow-[0_1px_3px_0_rgba(58,55,49,0.08),0_1px_2px_-1px_rgba(58,55,49,0.06)]"></video>`;
                break;
        }
    });
    
    html += '</div>';
    return html;
}

function getQuestionTypeLabel(type) {
    const labels = {
        'single_choice': 'Một lựa chọn',
        'multi_choice': 'Nhiều lựa chọn',
        'true_false': 'Đúng/Sai',
        'fill_number': 'Điền số',
        'fill_text': 'Điền từ',
        'fill_blank': 'Điền chỗ trống'
    };
    return labels[type] || type;
}

// ═══════════════════════════════════════════════════════════════════
// ANSWER HANDLING
// ═══════════════════════════════════════════════════════════════════

function saveAnswer(questionId, value, mode) {
    if (mode === 'test') {
        testAnswers[questionId] = value;
        updateQuestionBubble(questionId);
        saveToLocalStorage('test');
    }
    // Learning mode answers are read directly from DOM in getUserAnswer
}

function saveMultiAnswer(questionId, mode) {
    const prefix = mode === 'learning' ? 'learn' : 'test';
    const checkboxes = document.querySelectorAll(`input[name="${prefix}_${questionId}"]:checked`);
    const values = Array.from(checkboxes).map(cb => cb.value);
    
    if (mode === 'test') {
        if (values.length > 0) {
            testAnswers[questionId] = values;
        } else {
            delete testAnswers[questionId];
        }
        updateQuestionBubble(questionId);
        saveToLocalStorage('test');
    }
}

function saveBlankAnswer(questionId, mode) {
    const inputs = document.querySelectorAll(`.blank-input-${questionId}`);
    const values = Array.from(inputs).map(input => input.value.trim());
    
    if (mode === 'test') {
        const hasAny = values.some(v => v !== '');
        if (hasAny) {
            testAnswers[questionId] = values;
        } else {
            delete testAnswers[questionId];
        }
        updateQuestionBubble(questionId);
        saveToLocalStorage('test');
    }
}

function getUserAnswer(questionId, mode) {
    if (mode === 'test') {
        return testAnswers[questionId];
    } else {
        const q = learningQueue[learningIndex];
        
        switch (q.type) {
            case 'single_choice':
            case 'true_false':
                const radio = document.querySelector(`input[name="learn_${questionId}"]:checked`);
                return radio ? radio.value : undefined;
                
            case 'multi_choice':
                const checkboxes = document.querySelectorAll(`input[name="learn_${questionId}"]:checked`);
                return Array.from(checkboxes).map(cb => cb.value);
                
            case 'fill_number':
            case 'fill_text':
                const input = document.getElementById(`learn_${questionId}`);
                return input ? input.value : undefined;
                
            case 'fill_blank':
                const inputs = document.querySelectorAll(`.blank-input-${questionId}`);
                return Array.from(inputs).map(input => input.value.trim());
        }
    }
}

function checkAnswer(q, userAnswer) {
    if (userAnswer === undefined || userAnswer === null || userAnswer === '') return false;
    
    switch (q.type) {
        case 'single_choice':
        case 'true_false':
            return userAnswer === q.answer;
            
        case 'multi_choice':
            if (!Array.isArray(userAnswer) || !Array.isArray(q.answer)) return false;
            if (userAnswer.length !== q.answer.length) return false;
            const sorted1 = [...userAnswer].sort();
            const sorted2 = [...q.answer].sort();
            return sorted1.every((val, idx) => val === sorted2[idx]);
            
        case 'fill_number':
            // FIXED: normalize whitespace
            const userNum = String(userAnswer).replace(/\s/g, '');
            const correctNum = String(q.answer).replace(/\s/g, '');
            return parseFloat(userNum) == parseFloat(correctNum);
            
        case 'fill_text':
            // FIXED: case insensitive, trim whitespace
            return userAnswer.toLowerCase().replace(/\s/g, '') === String(q.answer).toLowerCase().replace(/\s/g, '');
            
        case 'fill_blank':
            if (!Array.isArray(userAnswer) || !Array.isArray(q.answer)) return false;
            if (userAnswer.length !== q.answer.length) return false;
            return userAnswer.every((val, idx) => 
                val.toLowerCase().replace(/\s/g, '') === q.answer[idx].toLowerCase().replace(/\s/g, '')
            );
    }
    
    return false;
}

function formatCorrectAnswer(q) {
    switch (q.type) {
        case 'single_choice':
        case 'true_false':
            const choice = q.choices.find(c => c.id === q.answer);
            return choice ? choice.text : q.answer;
            
        case 'multi_choice':
            const choices = q.choices.filter(c => q.answer.includes(c.id));
            return choices.map(c => c.text).join(', ');
            
        case 'fill_number':
        case 'fill_text':
            return q.answer;
            
        case 'fill_blank':
            return q.answer.join(', ');
    }
    
    return '';
}

function formatUserAnswer(q, userAnswer) {
    if (userAnswer === undefined || userAnswer === null) return '';
    
    switch (q.type) {
        case 'single_choice':
        case 'true_false':
            const choice = q.choices.find(c => c.id === userAnswer);
            return choice ? choice.text : userAnswer;
            
        case 'multi_choice':
            if (!Array.isArray(userAnswer)) return '';
            const choices = q.choices.filter(c => userAnswer.includes(c.id));
            return choices.map(c => c.text).join(', ');
            
        case 'fill_number':
        case 'fill_text':
            return userAnswer;
            
        case 'fill_blank':
            if (!Array.isArray(userAnswer)) return '';
            return userAnswer.join(', ');
    }
    
    return '';
}

// ═══════════════════════════════════════════════════════════════════
// LOCAL STORAGE
// ═══════════════════════════════════════════════════════════════════

function saveToLocalStorage(mode) {
    const urlParams = new URLSearchParams(window.location.search);
    const examUuid = urlParams.get('uuid');
    const key = `exam_${examUuid}_${mode}`;
    
    if (mode === 'test') {
        localStorage.setItem(key, JSON.stringify(testAnswers));
    }
}

function loadSavedAnswers(mode) {
    const urlParams = new URLSearchParams(window.location.search);
    const examUuid = urlParams.get('uuid');
    const key = `exam_${examUuid}_${mode}`;
    
    const saved = localStorage.getItem(key);
    if (saved && mode === 'test') {
        testAnswers = JSON.parse(saved);
    }
}

function clearSavedAnswers(mode) {
    const urlParams = new URLSearchParams(window.location.search);
    const examUuid = urlParams.get('uuid');
    const key = `exam_${examUuid}_${mode}`;
    localStorage.removeItem(key);
}

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function smoothScrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
