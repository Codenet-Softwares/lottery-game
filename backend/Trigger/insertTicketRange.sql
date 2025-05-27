USE lottery;



DELIMITER $$
CREATE TRIGGER insertTicketRange
AFTER INSERT ON TicketRange
FOR EACH ROW
BEGIN
  INSERT INTO lottery_archive.TicketRange (
    id,
    marketId,
    group_start,
    group_end,
    series_start,
    series_end,
    number_start,
    number_end,
    start_time,
    end_time,
    marketName,
    date,
    price,
    isActive,
    isWin,
    isVoid,
    hideMarketUser,
    inactiveGame,
    gameName,
    winReference,
    isUpdate,
    createdAt,
    updatedAt
  )
  VALUES (
  NEW.id,
    NEW.marketId,
    NEW.group_start,
    NEW.group_end,
    NEW.series_start,
    NEW.series_end,
    NEW.number_start,
    NEW.number_end,
    NEW.start_time,
    NEW.end_time,
    NEW.marketName,
    NEW.date,
    NEW.price,
    NEW.isActive,
    NEW.isWin,
    NEW.isVoid,
    NEW.hideMarketUser,
    NEW.inactiveGame,
    NEW.gameName,
    NEW.winReference,
    NEW.isUpdate,
    NEW.createdAt,
    NEW.updatedAt
  );
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS insertTicketRange;
