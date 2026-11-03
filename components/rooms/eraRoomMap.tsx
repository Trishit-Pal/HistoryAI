"use client";

import type { ComponentType } from "react";
import { DeepLearningRoom } from "./DeepLearningRoom";
import { ExpertSystemsRoom } from "./ExpertSystemsRoom";
import { FirstWinterRoom } from "./FirstWinterRoom";
import { FoundingRoom } from "./FoundingRoom";
import { FrontierRoom } from "./FrontierRoom";
import { GenerativeRoom } from "./GenerativeRoom";
import { PrecursorsRoom } from "./PrecursorsRoom";
import { SecondWinterRoom } from "./SecondWinterRoom";
import { StatisticalRoom } from "./StatisticalRoom";
import { SymbolicRoom } from "./SymbolicRoom";
import { TransformersRoom } from "./TransformersRoom";
import type { RoomProps } from "./roomProps";

export const ERA_ROOMS: Record<string, ComponentType<RoomProps>> = {
  era_0_precursors: PrecursorsRoom,
  era_1_founding: FoundingRoom,
  era_2_symbolic: SymbolicRoom,
  era_3_first_winter: FirstWinterRoom,
  era_4_expert_systems: ExpertSystemsRoom,
  era_5_second_winter: SecondWinterRoom,
  era_6_statistical: StatisticalRoom,
  era_7_deep_learning: DeepLearningRoom,
  era_8_transformers: TransformersRoom,
  era_9_generative: GenerativeRoom,
  era_10_frontier: FrontierRoom,
};
