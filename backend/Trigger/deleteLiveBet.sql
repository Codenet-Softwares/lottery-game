USE lottery;
SHOW COLUMNS FROM PurchaseLottery;



DROP TRIGGER IF EXISTS deleteLiveBet;
DELIMITER $$

CREATE TRIGGER deleteLiveBet
AFTER UPDATE ON PurchaseLottery
FOR EACH ROW
BEGIN
  -- Handle isDeleted change
  IF NEW.isDeleted = TRUE AND OLD.isDeleted = FALSE THEN
    UPDATE lottery_archive.PurchaseLottery
    SET isDeleted = TRUE
    WHERE purchaseId = OLD.purchaseId;
  END IF;

  -- Handle isParmanentDeleted change
  IF NEW.isParmanentDeleted = TRUE AND OLD.isParmanentDeleted = FALSE THEN
    UPDATE lottery_archive.PurchaseLottery
    SET isParmanentDeleted = TRUE
    WHERE purchaseId = OLD.purchaseId;
  END IF;
END$$

DELIMITER ;
