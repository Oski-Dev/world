/**
 * Main Script - Główny wątek UI
 * 
 * Ten skrypt obsługuje:
 * - Komunikację z web workerem
 * - Renderowanie na canvas
 * - Obsługę zdarzeń użytkownika
 */

class SimulatorUI {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.statsEl = document.getElementById('stats');
        this.tableBody = document.getElementById('creaturesTableBody');
        
        // Ustaw rozmiar canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Inicjalizuj web worker
        this.worker = new Worker('worker.js');
        this.worker.onmessage = (event) => this.handleWorkerMessage(event);
        
        // Inicjalizuj świat w workerze
        this.worker.postMessage({
            type: 'init',
            data: {
                width: this.canvas.width,
                height: this.canvas.height
            }
        });
        
        // Obsługa przycisków
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('addCreatureBtn').addEventListener('click', () => this.addCreature());
        
        // Stan
        this.isRunning = false;
        this.worldData = null;
        this.animationFrameId = null;
        this.nextCreatureId = 1;
        
        console.log('Simulator UI inicjalizowany');
    }

    /**
     * Zmień rozmiar canvas na rozmiar okna
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = Math.min(1000, container.clientWidth);
        this.canvas.height = Math.min(600, container.clientHeight);
        this.render();
    }

    /**
     * Uruchom symulację
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.worker.postMessage({ type: 'start', data: { speed: 1 } });
            this.gameLoop();
            console.log('Symulacja uruchomiona');
        }
    }

    /**
     * Wstrzymaj symulację
     */
    pause() {
        this.isRunning = false;
        this.worker.postMessage({ type: 'pause' });
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        console.log('Symulacja wstrzymana');
    }

    /**
     * Zresetuj świat
     */
    reset() {
        this.isRunning = false;
        this.worker.postMessage({
            type: 'reset',
            data: {
                width: this.canvas.width,
                height: this.canvas.height
            }
        });
        this.worldData = null;
        this.nextCreatureId = 1;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.render();
        this.updateStats();
        console.log('Świat zresetowany');
    }

    /**
     * Dodaj nową creaturkę w losowym miejscu
     */
    addCreature() {
        const x = Math.random() * (this.canvas.width - 40) + 20;
        const y = Math.random() * (this.canvas.height - 40) + 20;
        
        this.worker.postMessage({
            type: 'addCreature',
            data: {
                id: this.nextCreatureId,
                x: x,
                y: y,
                worldWidth: this.canvas.width,
                worldHeight: this.canvas.height
            }
        });
        
        this.nextCreatureId++;
        console.log(`Dodano creaturę w pozycji (${x.toFixed(0)}, ${y.toFixed(0)})`);
    }

    /**
     * Główna pętla gry
     */
    gameLoop = () => {
        if (this.isRunning) {
            // Poproś workera o aktualizację
            this.worker.postMessage({ type: 'update' });
            
            // Renderuj
            this.render();
            
            // Następna klatka
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        }
    }

    /**
     * Obsłuż wiadomość od workera
     */
    handleWorkerMessage(event) {
        const { type, data } = event.data;

        switch (type) {
            case 'worldUpdate':
                this.worldData = data;
                this.updateStats();
                break;

            case 'worldState':
                this.worldData = data;
                this.render();
                this.updateStats();
                break;

            default:
                console.log(`[Main] Odebrana wiadomość: ${type}`);
        }
    }

    /**
     * Renderuj świat na canvas
     */
    render() {
        // Czyść canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.worldData) {
            // Pokaż komunikat podczas ładowania
            this.ctx.fillStyle = '#888';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Inicjalizacja...', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }

        // Rysuj wszystkie stworzenia
        const creatures = this.worldData.creatures;
        
        for (const creature of creatures) {
            this.drawCreature(creature);
        }

        // Pokaż numer generacji
        this.ctx.fillStyle = '#aaa';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Gen: ${this.worldData.generation}`, 10, 20);
    }

    /**
     * Rysuj jedno stworzenie jako strzałkę lub krzyżyk (jeśli martwe)
     */
    drawCreature(creature) {
        const x = creature.x;
        const y = creature.y;
        
        // Jeśli creaturka jest martwa - rysuj krzyżyk
        if (creature.isDead) {
            const crossSize = 8;
            this.ctx.strokeStyle = creature.color;
            this.ctx.lineWidth = 2;
            
            // Pozioma linia
            this.ctx.beginPath();
            this.ctx.moveTo(x - crossSize, y);
            this.ctx.lineTo(x + crossSize, y);
            this.ctx.stroke();
            
            // Pionowa linia
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - crossSize);
            this.ctx.lineTo(x, y + crossSize);
            this.ctx.stroke();
            
            return; // Nie rysuj nic więcej
        }
        
        // Rysuj żywą creaturkę jako strzałkę
        const length = 12;
        const width = 4;
        
        // Koniec strzałki (głowica)
        const endX = x + Math.cos(creature.angle) * length;
        const endY = y + Math.sin(creature.angle) * length;
        
        this.ctx.fillStyle = creature.color;
        this.ctx.strokeStyle = creature.color;
        this.ctx.lineWidth = 2;
        
        // Rysuj tułów (linia)
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Rysuj głowicę (trójkąt)
        const arrowHeadLength = 6;
        const angle1 = creature.angle + Math.PI * 0.85;
        const angle2 = creature.angle - Math.PI * 0.85;
        const headX1 = endX + Math.cos(angle1) * arrowHeadLength;
        const headY1 = endY + Math.sin(angle1) * arrowHeadLength;
        const headX2 = endX + Math.cos(angle2) * arrowHeadLength;
        const headY2 = endY + Math.sin(angle2) * arrowHeadLength;
        
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(headX1, headY1);
        this.ctx.lineTo(headX2, headY2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Pokaż energię jako mały pasek
        const energyPercent = creature.energy / creature.maxEnergy;
        const barWidth = 10;
        const barHeight = 2;
        
        // Tło paska
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x - barWidth / 2, y - 10, barWidth, barHeight);
        
        // Pasek energii
        const energyColor = energyPercent > 0.5 ? '#4CAF50' : energyPercent > 0.25 ? '#FFC107' : '#F44336';
        this.ctx.fillStyle = energyColor;
        this.ctx.fillRect(x - barWidth / 2, y - 10, barWidth * energyPercent, barHeight);
    }

    /**
     * Aktualizuj statystyki
     */
    updateStats() {
        if (this.worldData) {
            const creatureCount = this.worldData.creatures.length;
            const generation = this.worldData.generation;
            this.statsEl.textContent = `Creatures: ${creatureCount} | Generation: ${generation}`;
            
            // Zaktualizuj tabelkę
            this.updateCreaturesTable();
        }
    }

    /**
     * Zaktualizuj tabelkę z listą creaturek
     */
    updateCreaturesTable() {
        if (!this.worldData || !this.worldData.creatures) {
            this.tableBody.innerHTML = '';
            return;
        }

        // Wyczyść tabelkę
        this.tableBody.innerHTML = '';

        // Dodaj każdą creaturę
        for (const creature of this.worldData.creatures) {
            const row = document.createElement('tr');
            
            const angleDegrees = (creature.angle * 180 / Math.PI).toFixed(0);
            const speedFormatted = creature.currentSpeed.toFixed(2);
            const energyFormatted = creature.energy.toFixed(1);
            const status = creature.isDead ? 'Dead ☠️' : 'Alive ✓';
            const statusColor = creature.isDead ? '#FF6B6B' : '#4CAF50';
            
            row.innerHTML = `
                <td>${creature.id}</td>
                <td>${creature.x.toFixed(0)}</td>
                <td>${creature.y.toFixed(0)}</td>
                <td>${angleDegrees}°</td>
                <td>${speedFormatted}</td>
                <td>${energyFormatted}</td>
                <td>${creature.gender.charAt(0).toUpperCase() + creature.gender.slice(1)}</td>
                <td>${creature.age}</td>
                <td><span style="color: ${statusColor}; font-weight: bold;">${status}</span></td>
                <td><span class="color-swatch" style="background-color: ${creature.color};"></span></td>
            `;
            
            this.tableBody.appendChild(row);
        }
    }
}

// Inicjalizuj simulator
let simulator;
document.addEventListener('DOMContentLoaded', () => {
    simulator = new SimulatorUI();
});
