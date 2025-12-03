    // --- JavaScript: Logic & LocalStorage ---

    // Selectors
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const list = document.getElementById('todo-list');
    const streakDisplay = document.getElementById('streak-display');
    const badgeContainer = document.getElementById('badge-list');
    const dateDisplay = document.getElementById('date-display');

    // State Variables
    let todos = JSON.parse(localStorage.getItem('fitTodos')) || [];
    let userStats = JSON.parse(localStorage.getItem('fitStats')) || {
        streak: 0,
        lastCompletedDate: null,
        badges: []
    };

    // Badge Definitions
    const badgeMilestones = {
        7: "🥉 1 Week",
        14: "🥈 2 Weeks",
        21: "🥇 3 Weeks",
        30: "🏆 Month Warrior",
        75: "👑 75 Hard Completed",
        150: "👑 75 Hard 2 Completed",
        225: "👑 75 Hard 3 Completed",
        300: "👑 75 Hard 4 Completed",
        375: "👑 75 Hard 5 Completed"

    };

    // Initialization
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    dateDisplay.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    renderTodos();
    updateStatsUI();

    // Event Listeners
    addBtn.addEventListener('click', addTodo);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // --- Functions ---

    function addTodo() {
        const text = input.value.trim();
        if (text === '') return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false
        };

        todos.push(todo);
        saveAndRender();
        input.value = '';
    }

    function toggleComplete(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        
        saveAndRender();
        checkDailyStreak();
    }

    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveAndRender();
    }

    function renderTodos() {
        list.innerHTML = '';
        if(todos.length === 0) {
            list.innerHTML = `<li style="justify-content:center; background:transparent; opacity:0.5;">No tasks today. Time to grind! 💪</li>`;
            return;
        }

        todos.forEach(todo => {
            const li = document.createElement('li');
            if (todo.completed) li.classList.add('completed');

            li.innerHTML = `
                <div class="check-circle" onclick="toggleComplete(${todo.id})">
                    ${todo.completed ? '✓' : ''}
                </div>
                <span onclick="toggleComplete(${todo.id})">${todo.text}</span>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">&times;</button>
            `;
            list.appendChild(li);
        });
    }

    // --- Streak & Badge Logic ---

    function checkDailyStreak() {
        // 1. Check if there are tasks and if ALL are completed
        const allCompleted = todos.length > 0 && todos.every(t => t.completed);

        if (allCompleted) {
            // Check if we already incremented streak today
            if (userStats.lastCompletedDate !== today) {
                
                // Check if the streak is consecutive
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (userStats.lastCompletedDate === yesterdayStr) {
                    // Consecutive day
                    userStats.streak++;
                } else {
                    // Broken streak (or first time)
                    userStats.streak = 1; 
                }

                // Update date
                userStats.lastCompletedDate = today;
                
                // Check for Badges
                checkForBadges();

                // Trigger celebration effect UI
                streakDisplay.classList.add('celebrate');
                setTimeout(() => streakDisplay.classList.remove('celebrate'), 1000);

                saveStats();
                updateStatsUI();
            }
        }
    }

    function checkForBadges() {
        const currentStreak = userStats.streak;
        
        // If current streak hits a milestone and we haven't earned it yet (optional logic, simplified here)
        if (badgeMilestones[currentStreak]) {
            const newBadge = badgeMilestones[currentStreak];
            if (!userStats.badges.includes(newBadge)) {
                userStats.badges.push(newBadge);
                alert(`🎉 Congratulations! You earned the "${newBadge}" badge!`);
            }
        }
        // Fallback for recurring weekly badges if not specific milestone
        else if (currentStreak % 7 === 0 && currentStreak > 0) {
             const weeklyBadge = `🔥 ${currentStreak} Days`;
             if (!userStats.badges.includes(weeklyBadge)) {
                userStats.badges.push(weeklyBadge);
                alert(`Wow! Another week crushed! Added badge: ${weeklyBadge}`);
             }
        }
    }

    function updateStatsUI() {
        streakDisplay.innerText = `${userStats.streak} days`;
        
        badgeContainer.innerHTML = '';
        userStats.badges.forEach(badge => {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'badge';
            badgeEl.innerText = badge;
            badgeContainer.appendChild(badgeEl);
        });
    }

    // --- Storage Helpers ---

    function saveAndRender() {
        localStorage.setItem('fitTodos', JSON.stringify(todos));
        renderTodos();
    }

    function saveStats() {
        localStorage.setItem('fitStats', JSON.stringify(userStats));
    }