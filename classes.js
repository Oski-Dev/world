/**
 * Creature - Klasa reprezentująca pojedyncze stworzenie w świecie
 */
class Creature {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        
        // Dodaj tutaj atrybuty w kolejnych krokach
    }

    /**
     * Aktualizuj stan stworzenia
     */
    update() {
        // Logika aktualizacji będzie dodana
    }

    /**
     * Zwróć dane stworzenia do serializacji
     */
    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y
        };
    }

    /**
     * Załaduj dane stworzenia
     */
    static fromJSON(data) {
        const creature = new Creature(data.id, data.x, data.y);
        return creature;
    }
}

/**
 * World - Klasa reprezentująca świat z wszystkimi stworami
 */
class World {
    constructor(width = 800, height = 600) {
        this.width = width;
        this.height = height;
        this.creatures = new Map(); // Map<id, Creature>
        this.generation = 0;
        
        // Dodaj tutaj atrybuty w kolejnych krokach
    }

    /**
     * Dodaj nowe stworzenie do świata
     */
    addCreature(creature) {
        this.creatures.set(creature.id, creature);
    }

    /**
     * Usuń stworzenie ze świata
     */
    removeCreature(id) {
        this.creatures.delete(id);
    }

    /**
     * Aktualizuj cały świat - główna pętla symulacji
     */
    update() {
        // Aktualizuj wszystkie stworzenia
        for (const creature of this.creatures.values()) {
            creature.update();
        }
        
        this.generation++;
    }

    /**
     * Zwróć wszystkie stworzenia
     */
    getCreatures() {
        return Array.from(this.creatures.values());
    }

    /**
     * Zwróć dane świata do serializacji
     */
    toJSON() {
        return {
            width: this.width,
            height: this.height,
            generation: this.generation,
            creatures: this.getCreatures().map(c => c.toJSON())
        };
    }

    /**
     * Załaduj dane świata
     */
    static fromJSON(data) {
        const world = new World(data.width, data.height);
        world.generation = data.generation;
        
        for (const creatureData of data.creatures) {
            const creature = Creature.fromJSON(creatureData);
            world.addCreature(creature);
        }
        
        return world;
    }
}

// Eksportuj klasy dla web workera
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Creature, World };
}
