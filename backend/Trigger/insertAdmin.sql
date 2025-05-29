USE lottery;
DROP TRIGGER IF EXISTS insertAdmin;

DELIMITER $$
CREATE TRIGGER insertAdmin
AFTER INSERT ON Admins
FOR EACH ROW
BEGIN
  INSERT INTO lottery_archive.Admins (
    id,
    adminId,
    userName,
    password,
    role,
    permissions,
    isReset
    
  )
  VALUES (
    NEW.id,
    NEW.adminId,
    NEW.userName,
    NEW.password,
    NEW.role,
    NEW.permissions,
    NEW.isReset
   
  );
END$$
DELIMITER ;