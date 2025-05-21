USE lottery;

 --  DROP TRIGGER IF EXISTS insertPurchaseLottery;

DELIMITER $$

CREATE TRIGGER insertPurchaseLottery
AFTER INSERT ON PurchaseLottery
FOR EACH ROW
BEGIN
  INSERT INTO lottery_archive.PurchaseLottery (
	id,
    purchaseId,
    generateId,
    userId,
    userName,
    `group`,          
    series,
    `number`,          
    sem,
    marketName,
    marketId,
    lotteryPrice,
    price,
    resultAnnouncement,
    gameName,
    hidePurchase,
    settleTime,
    isVoid,
    isDeleted,
    isParmanentDeleted,
    createdAt,
    updatedAt
  )
  VALUES (
	NEW.id,
    NEW.purchaseId,
    NEW.generateId,
    NEW.userId,
    NEW.userName,
    NEW.`group`,
    NEW.series,
    NEW.`number`,
    NEW.sem,
    NEW.marketName,
    NEW.marketId,
    NEW.lotteryPrice,
    NEW.price,
    NEW.resultAnnouncement,
    NEW.gameName,
    NEW.hidePurchase,
    NEW.settleTime,
    NEW.isVoid,
    NEW.isDeleted,
    NEW.isParmanentDeleted,
    NEW.createdAt,
    NEW.updatedAt
  );
END$$

DELIMITER ;
