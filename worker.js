/**
 * Worker Script - Symulacja świata w osobnym wątku
 * 
 * Ten skrypt działa w web workerze i obsługuje całą ciężką logikę obliczeniową
 * poza głównym wątkiem UI.
 */

// Importuj klasy
importScripts('classes.js');

let world = null;
let isRunning = false;
let simulationSpeed = 1; // Liczba aktualizacji na frame

/**
 * Inicjalizuj świat
 */
self.onmessage = (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'init':
            // Inicjalizacja świata
            if (data.worldData) {
                world = World.fromJSON(data.worldData);
            } else {
                world = new World(data.width, data.height);
            }
            console.log('[Worker] Świat zainicjalizowany');
            break;

        case 'start':
            // Uruchom symulację
            isRunning = true;
            simulationSpeed = data.speed || 1;
            console.log('[Worker] Symulacja uruchomiona');
            break;

        case 'pause':
            // Wstrzymaj symulację
            isRunning = false;
            console.log('[Worker] Symulacja wstrzymana');
            break;

        case 'reset':
            // Zresetuj świat
            world = new World(data.width, data.height);
            isRunning = false;
            console.log('[Worker] Świat zresetowany');
            break;

        case 'addCreature':
            // Dodaj stworzenie
            if (world) {
                const creature = new Creature(data.id, data.x, data.y);
                world.addCreature(creature);
            }
            break;

        case 'update':
            // Wykonaj jeden krok symulacji
            if (world && isRunning) {
                for (let i = 0; i < simulationSpeed; i++) {
                    world.update();
                }
                
                // Wyślij zaktualizowane dane do głównego wątku
                self.postMessage({
                    type: 'worldUpdate',
                    data: world.toJSON()
                });
            }
            break;

        case 'getWorld':
            // Zwróć aktualny stan świata
            if (world) {
                self.postMessage({
                    type: 'worldState',
                    data: world.toJSON()
                });
            }
            break;

        case 'setSimulationSpeed':
            // Ustaw szybkość symulacji
            simulationSpeed = data.speed;
            console.log(`[Worker] Szybkość symulacji: ${simulationSpeed}x`);
            break;

        default:
            console.warn(`[Worker] Nieznana komenda: ${type}`);
    }
};

console.log('[Worker] Web Worker załadowany i czeka na komendy');
