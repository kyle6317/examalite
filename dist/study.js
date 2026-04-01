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

// Learning mode state
let learningQueue = [];
let learningIndex = 0;
let learningAnswered = new Set();
let learningFirstTryCorrect = 0;
let learningStartTime = null;

// Test mode state
let testAnswers = {};
let testStartTime = null;
let timerInterval = null;
let duration_minutes = null;

// Question mapping (handles shuffled questions)
let questionIdToOriginal = {};
let originalToShuffled = {};

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
    
    await fetchExamMetadata(examUuid);
});

// ═══════════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

async function fetchExamMetadata(uuid) {
    try {
        updateLoadingText('Đang kiểm tra bài kiểm tra...');
        
        // Call Supabase Edge Function to validate and get metadata
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
        
        // Show preparation screen
        showPrepScreen();
        
    } catch (error) {
        console.error('Error fetching exam:', error);
        showError(error.message);
    }
}

async function downloadExam(signedUrl) {
    try {
        const response = await fetch(signedUrl);
        if (!response.ok) throw new Error('Không thể tải file ZIP');
        
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
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
    
    // Populate exam info
    document.getElementById('examTitle').textContent = examMetadata.title || 'Bài kiểm tra';
    document.getElementById('examDescription').textContent = examMetadata.description || '';
    
    const durationText = examMetadata.duration_minutes 
        ? `${examMetadata.duration_minutes} phút` 
        : 'Không giới hạn';
    document.getElementById('examDuration').textContent = durationText;
    
    // We'll update question count after download
    document.getElementById('totalQuestions').textContent = '...';
    
    // Auto-start download
    startDownload();
}

async function startDownload() {
    const progressContainer = document.getElementById('downloadProgress');
    const downloadBar = document.getElementById('downloadBar');
    const downloadText = document.getElementById('downloadText');
    
    progressContainer.classList.remove('hidden');
    
    // Simulate progress (since we can't track actual download progress easily)
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
        
        // Update question count
        const totalQuestions = countTotalQuestions();
        document.getElementById('totalQuestions').textContent = totalQuestions;
        
        // Show config section
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
// MODE TOGGLE
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
    
    // Prepare questions
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
        // Shuffle groups
        const shuffledGroups = [...examData.groups].sort(() => Math.random() - 0.5);
        
        shuffledGroups.forEach(group => {
            // Shuffle questions within group
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
            // Still shuffle questions within groups, but don't shuffle groups
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
    }
    
    // Shuffle choices if needed
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
    
    // Update progress
    const answered = learningAnswered.size;
    const total = countTotalQuestions();
    document.getElementById('learningProgress').textContent = `Câu ${answered + 1} / ${total}`;
    
    const progressPercent = (answered / total) * 100;
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
    
    // Confirm button
    html += `<div class="mt-6">
        <button id="confirmBtn" onclick="checkLearningAnswer()" class="w-full bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-lg font-semibold transition-colors">
            Xác nhận
        </button>
    </div>`;
    
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
    
    // Show result
    showLearningResult(q, userAnswer, isCorrect);
}

function showLearningResult(q, userAnswer, isCorrect) {
    const answerSection = document.getElementById('answerSection');
    const confirmBtn = document.getElementById('confirmBtn');
    
    // Disable inputs
    const inputs = answerSection.querySelectorAll('input');
    inputs.forEach(input => input.disabled = true);
    
    // Show correct/incorrect indicator
    const resultHtml = `
        <div class="mt-4 p-4 rounded-lg ${isCorrect ? 'bg-success-50 border border-success-200' : 'bg-danger-50 border border-danger-200'}">
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
    
    answerSection.insertAdjacentHTML('beforeend', resultHtml);
    
    // Change button to Next
    if (isCorrect) {
        confirmBtn.textContent = 'Câu tiếp theo';
        confirmBtn.onclick = nextLearningQuestion;
    } else {
        confirmBtn.textContent = 'Thử lại sau';
        confirmBtn.onclick = requeueQuestion;
    }
}

function nextLearningQuestion() {
    learningIndex++;
    renderLearningQuestion();
}

function requeueQuestion() {
    const q = learningQueue[learningIndex];
    learningQueue.splice(learningIndex, 1);
    
    if (shuffleQuestions) {
        // Insert at random position in remaining questions
        const insertPos = learningIndex + Math.floor(Math.random() * (learningQueue.length - learningIndex + 1));
        learningQueue.splice(insertPos, 0, q);
    } else {
        // Add to end
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

function quitLearning() {
    if (confirm('Bạn có chắc muốn thoát? Tiến trình sẽ không được lưu.')) {
        location.reload();
    }
}

// ═══════════════════════════════════════════════════════════════════
// TEST MODE
// ═══════════════════════════════════════════════════════════════════

function startTestMode() {
    const questions = prepareQuestions();
    testAnswers = {};
    testStartTime = Date.now();
    
    document.getElementById('prepScreen').classList.add('hidden');
    document.getElementById('testScreen').classList.remove('hidden');
    
    document.getElementById('sidebarTitle').textContent = examMetadata.title || 'Bài kiểm tra';
    
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
        
        // Group context (if first question of group or always show)
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
    
    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenu.classList.contains('hidden')) {
        toggleMobileMenu();
    }
}

function updateQuestionBubble(questionId) {
    const bubble = document.getElementById('bubble-' + questionId);
    if (bubble) {
        bubble.classList.remove('bg-white', 'border-paper-300', 'text-ink-400');
        bubble.classList.add('bg-accent-100', 'border-accent-200', 'text-accent-600');
    }
}

function startTimer() {
    if (duration_minutes) {
        // Countdown timer
        let timeLeft = duration_minutes * 60;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            document.getElementById('timer').textContent = timeStr;
            document.getElementById('mobileTimer').textContent = timeStr;
            document.getElementById('mobileTimerFull').textContent = timeStr;
            
            // Warning when < 5 minutes
            if (timeLeft <= 300 && timeLeft > 0) {
                document.getElementById('timerSection').classList.add('timer-warning');
                document.getElementById('timer').classList.add('text-warning-300');
            }
            
            // Auto-submit when time's up
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitTest();
            }
        }, 1000);
    } else {
        // Count up timer
        let elapsed = 0;
        
        timerInterval = setInterval(() => {
            elapsed++;
            
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            document.getElementById('timer').textContent = timeStr;
            document.getElementById('mobileTimer').textContent = timeStr;
            document.getElementById('mobileTimerFull').textContent = timeStr;
        }, 1000);
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

function submitTest() {
    clearInterval(timerInterval);
    
    // Count answered questions
    const answeredCount = Object.keys(testAnswers).length;
    const totalCount = countTotalQuestions();
    
    const unanswered = totalCount - answeredCount;
    
    let message = 'Bạn có chắc chắn muốn nộp bài?';
    if (unanswered > 0) {
        message += `\n\nBạn còn ${unanswered} câu chưa trả lời.`;
    }
    
    if (!confirm(message)) {
        if (duration_minutes) {
            // Resume countdown
            startTimer();
        }
        return;
    }
    
    gradeTest();
}

function gradeTest() {
    const questions = prepareQuestions();
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
    
    // Group stats
    renderGroupStats(results);
    
    // Detailed review
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
    
    let html = '';
    Object.values(groupMap).forEach(group => {
        const percent = Math.round((group.correct / group.total) * 100);
        html += `
            <div class="flex items-center gap-4 mb-3">
                <div class="flex-1">
                    <div class="text-sm font-semibold text-ink-500 mb-1">${escapeHtml(group.label)}</div>
                    <div class="text-xs text-ink-300">${group.correct} / ${group.total} đúng</div>
                </div>
                <div class="text-lg font-bold ${percent >= 50 ? 'text-success-300' : 'text-danger-300'}">${percent}%</div>
            </div>
        `;
    });
    
    document.getElementById('groupStatsContent').innerHTML = html;
}

function renderDetailedReview(results) {
    window.allResults = results; // Store for filtering
    filterResults('all');
}

function filterResults(filter) {
    const results = window.allResults || [];
    
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-accent-500', 'text-white');
        btn.classList.add('bg-paper-100', 'text-ink-500');
    });
    
    event.target.classList.remove('bg-paper-100', 'text-ink-500');
    event.target.classList.add('bg-accent-500', 'text-white');
    
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
        html += `<div class="text-xs font-semibold text-ink-300 uppercase tracking-wide">Câu ${index + 1}</div>`;
        html += `<div class="text-sm font-semibold ${r.isCorrect ? 'text-success-300' : 'text-danger-300'}">${r.isCorrect ? 'Chính xác' : 'Chưa chính xác'}</div>`;
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
    location.reload();
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
                    onchange="saveAnswer('${q.id}', this.value, '${mode}')"
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
                    onchange="saveAnswer('${q.id}', this.value, '${mode}')"
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
                            onchange="saveBlankAnswer('${q.id}', '${mode}')"
                            class="blank-input w-full px-4 py-3 border-2 border-paper-200 rounded-lg focus:border-accent-500 focus:outline-none text-ink-600"
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
}

function saveMultiAnswer(questionId, mode) {
    const prefix = mode === 'learning' ? 'learn' : 'test';
    const checkboxes = document.querySelectorAll(`input[name="${prefix}_${questionId}"]:checked`);
    const values = Array.from(checkboxes).map(cb => cb.value);
    
    if (mode === 'test') {
        testAnswers[questionId] = values;
        updateQuestionBubble(questionId);
        saveToLocalStorage('test');
    }
}

function saveBlankAnswer(questionId, mode) {
    const inputs = document.querySelectorAll('.blank-input');
    const values = Array.from(inputs).map(input => input.value.trim());
    
    if (mode === 'test') {
        testAnswers[questionId] = values;
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
                const inputs = document.querySelectorAll('.blank-input');
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
            return parseFloat(userAnswer) == parseFloat(q.answer);
            
        case 'fill_text':
            return userAnswer.toLowerCase().trim() === q.answer.toLowerCase().trim();
            
        case 'fill_blank':
            if (!Array.isArray(userAnswer) || !Array.isArray(q.answer)) return false;
            if (userAnswer.length !== q.answer.length) return false;
            return userAnswer.every((val, idx) => 
                val.toLowerCase().trim() === q.answer[idx].toLowerCase().trim()
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
