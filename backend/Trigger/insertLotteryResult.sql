USE lottery;
DROP TRIGGER IF EXISTS insertWinResultRequest;


DELIMITER $$

CREATE TRIGGER insertLotteryResult
AFTER INSERT ON LotteryResult
FOR EACH ROW
BEGIN
  INSERT INTO lottery_archive.LotteryResult (
    resultId,
    ticketNumber,
    prizeCategory,
    prizeAmount,
    complementaryPrize,
    marketName,
    marketId,
    isRevoke,
    createdAt,
    updatedAt
  ) VALUES (
    NEW.resultId,
    NEW.ticketNumber,
    NEW.prizeCategory,
    NEW.prizeAmount,
    NEW.complementaryPrize,
    NEW.marketName,
    NEW.marketId,
    NEW.isRevoke,
    NEW.createdAt,
    NEW.updatedAt
  );
END;

$$
DELIMITER ;
