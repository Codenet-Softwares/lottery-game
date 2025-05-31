USE lottery;
-- DROP TRIGGER IF EXISTS insertWinResultRequest;


DELIMITER $$

CREATE TRIGGER insertWinResultRequest
AFTER INSERT ON winResultRequest 
FOR EACH ROW
BEGIN
  INSERT INTO lottery_archive.winResultRequest (
    resultId,
    adminId,
    declearBy,
    ticketNumber,
    prizeCategory,
    prizeAmount,
    complementaryPrize,
    marketName,
    marketId,
    type,
    isApproved,
    isReject,
    status,
    remarks,
    isRevoke,
    createdAt,
    updatedAt
  )
  VALUES (
    NEW.resultId,
    NEW.adminId,
    NEW.declearBy,
    NEW.ticketNumber,
    NEW.prizeCategory,
    NEW.prizeAmount,
    NEW.complementaryPrize,
    NEW.marketName,
    NEW.marketId,
    NEW.type,
    NEW.isApproved,
    NEW.isReject,
    NEW.status,
    NEW.remarks,
    NEW.isRevoke,
    NEW.createdAt,
    NEW.updatedAt
  );
END;
$$

DELIMITER ;
