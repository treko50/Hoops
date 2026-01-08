package com.hoops.stats.card.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * FIFA Ultimate Team Style Player Attributes
 * 6 main categories with detailed sub-attributes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerAttribute {
    private int overall;
    private Map<String, Integer> subAttributes;

    /**
     * Offense Attributes
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Offense {
        private int overall;
        private int finishingAtRim;
        private int midRangeShooting;
        private int threePointShooting;
        private int freeThrowShooting;
        private int shotCreation;
        private int offensiveConsistency;
    }

    /**
     * Playmaking Attributes
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Playmaking {
        private int overall;
        private int vision;
        private int passingAccuracy;
        private int ballHandling;
        private int assistPercentage;
        private int courtAwareness;
        private int pickAndRollIQ;
    }

    /**
     * Defense Attributes
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Defense {
        private int overall;
        private int perimeterDefense;
        private int interiorDefense;
        private int stealAbility;
        private int blockAbility;
        private int defensiveIQ;
        private int defensiveConsistency;
    }

    /**
     * Athleticism Attributes
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Athleticism {
        private int overall;
        private int speed;
        private int acceleration;
        private int stamina;
        private int strength;
        private int vertical;
        private int agility;
    }

    /**
     * Rebounding Attributes
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Rebounding {
        private int overall;
        private int offensiveRebounding;
        private int defensiveRebounding;
        private int boxOutAbility;
        private int reboundingIQ;
        private int positioning;
        private int contestedRebounding;
    }

    /**
     * Efficiency Attributes
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Efficiency {
        private int overall;
        private int trueShootingPct;
        private int turnoverRate;
        private int usageEfficiency;
        private int plusMinusImpact;
        private int shotSelectionIQ;
        private int consistencyFactor;
    }

    /**
     * Complete Advanced Attributes
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvancedAttributes {
        private Offense offense;
        private Playmaking playmaking;
        private Defense defense;
        private Athleticism athleticism;
        private Rebounding rebounding;
        private Efficiency efficiency;
    }
}
