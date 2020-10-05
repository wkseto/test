import {
  CHAOS_LOW_LEVEL,
  REGAL_LOW_LEVEL,
  WARNING_QUANTITY_THRESHOLD
} from '../constants/appConfig'

export interface UIResult {
  chaosCount: number
  regalCount: number
  totalCount: number
  isDanger: boolean
  isWarning: boolean
}

const initializeResult = (): UIResult => ({
  chaosCount: 0,
  regalCount: 0,
  totalCount: 0,
  isDanger: false,
  isWarning: false
})

const initializeResults = () => ({
  bodyArmour: initializeResult(),
  helmet: initializeResult(),
  glove: initializeResult(),
  boot: initializeResult(),
  belt: initializeResult(),
  amulet: initializeResult(),
  ring: initializeResult(),
  hand: initializeResult()
});

exports.aggregateChaosRecipe = (stashItems: any) => {
  const results = initializeResults()

  stashItems.forEach((stashItem: any) => {
    if (stashItem.identified) return;
    if (!stashItem.isRare) return;
    if (stashItem.itemLevel < CHAOS_LOW_LEVEL) return;
    if (stashItem.type === null) return;

    let resultType = stashItem.type;
    let resultValue = 1;

    if (['ring', 'oneHand'].includes(stashItem.type)) resultValue = 0.5;
    if (['oneHand', 'twoHand'].includes(stashItem.type)) resultType = 'hand';

    // @ts-ignore:
    let itemCounts = results[resultType];

    if (stashItem.itemLevel < REGAL_LOW_LEVEL) {
      itemCounts.chaosCount += resultValue;
    } else {
      itemCounts.regalCount += resultValue;
    }
  });

  Object.keys(results).forEach((resultKey) => {
    // @ts-ignore:
    const result = results[resultKey];
    result.totalCount = Math.floor(result.chaosCount + result.regalCount);
  });

  const globalTotalCount = Math.min(
    ...Object.values(results).map(({ totalCount }) => totalCount)
  );

  Object.keys(results).forEach((resultKey) => {
    // @ts-ignore:
    const result = results[resultKey];

    result.isDanger = result.totalCount === globalTotalCount;
    result.isWarning = (result.totalCount - WARNING_QUANTITY_THRESHOLD) <= globalTotalCount;
  });

  // @ts-ignore:
  results._meta = {
    totalCount: globalTotalCount
  };

  return results;
};
