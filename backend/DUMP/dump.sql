-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: rott
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cinema`
--

DROP TABLE IF EXISTS `cinema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cinema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinema`
--

LOCK TABLES `cinema` WRITE;
/*!40000 ALTER TABLE `cinema` DISABLE KEYS */;
INSERT INTO `cinema` VALUES (1,'Balti Jaama Cinema'),(2,'Õismäe ring Central Cinema'),(3,'Ülemiste Järve Underwater Cinema');
/*!40000 ALTER TABLE `cinema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `img` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `genre` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `popularity` tinyint DEFAULT NULL,
  `rating` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idmovies_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` (`id`, `img`, `name`, `genre`, `description`, `popularity`, `rating`) VALUES (1, 'https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg', 'Spider-Man: Brand New Day', 'Science Fiction', 'Fighting crime full-time as Spider-Man in a world that doesn''t remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.', 94, 78),  (2, 'https://image.tmdb.org/t/p/w500/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg', 'Coyote vs. Acme', 'Comedy', 'After Acme products fail him one too many times in his dogged pursuit of the Roadrunner, Wile E. Coyote decides to hire a billboard lawyer to sue the Acme Corporation.', 5, 75),  (3, 'https://image.tmdb.org/t/p/w500/tN799oUR0f1gUKDYdMNrDaY7I51.jpg', 'Colony', 'Action', 'Professor Se-jeong is thrust into a bloody nightmare when a rapidly mutating virus is released during a biotech conference causing authorities to seal the facility. Trapped inside with no escape, Se-jeong along with a small group of survivors must fight to stay alive while the infected undergo horrific transformations.', 76, 80),  (4, 'https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg', 'The Odyssey', 'Adventure', 'Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.', 11, 80),  (5, 'https://image.tmdb.org/t/p/w500/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg', 'The End of Oak Street', 'Science Fiction', 'After a mysterious cosmic event rips Oak Street from suburbia and transports their neighborhood to someplace unknown, the Platt family soon discovers that their very survival depends on them sticking together as they navigate their now unrecognizable surroundings.', 68, 67),  (6, 'https://image.tmdb.org/t/p/w500/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg', 'The Mongoose', 'Action', 'A falsely accused war hero with nothing to lose leads police on an epic televised cross-country car chase, helped by members of his former Special Forces Army battalion and closely monitored by a fascinated public rooting for his safe getaway.', 39, 0),  (7, 'https://image.tmdb.org/t/p/w500/pu2VxGlpGwffOx292w18b1tv96j.jpg', 'Mutiny', 'Action', 'After witnessing his billionaire boss'' murder and being framed for the crime, Cole Reed boards a cargo ship on a one-man crusade to avenge his boss'' death only to discover an international conspiracy.', 42, 64),  (8, 'https://image.tmdb.org/t/p/w500/gaet1xQ2nxrG0V1Ep9T20ZMNEIC.jpg', 'Moana', 'Family', 'Teenage Moana answers the Ocean''s call and, for the first time, voyages beyond the reef of her island of Motunui with infamous demigod Maui on an unforgettable journey to restore prosperity to her people.', 97, 73),  (9, 'https://image.tmdb.org/t/p/w500/6rpvddXbaQPOi0fB2HKWbZ3uUSg.jpg', 'Drawn Together', 'Romance', 'Marfil, daughter of a powerful Spanish businessman, sees her life in New York turned upside down when she is kidnapped and released without explanation. Her father hires Sebastian Moore as bodyguard and, forced to spend every minute together, an inevitable attraction ignites in a world where nothing is as it seems.', 86, 66),  (10, 'https://image.tmdb.org/t/p/w500/3r0O6BW9USoZ9mteCVyNKMQriRL.jpg', 'Shape of My Heart', 'Romance', 'A romance about a man and a woman who, due to an unexpected event, end up switching bodies. Despite coming from completely different backgrounds and environments, the two try to overcome the various difficulties that arise from their body swap.', 85, 56),  (11, 'https://image.tmdb.org/t/p/w500/1WGq9cMuj09tnTJ5wdkINOJff04.jpg', 'Loves of a French Pussycat', 'Comedy', 'Rolf, a sex-advice columnist and a lecher, has affairs with numerous women, but never a permanent relationship. Suzanne, one of his ex-lovers, offers to bet that no woman can get Rolf to propose marriage, a bet her girlfriend Andrea eagerly accepts. But there''s a catch: To win the bet, Andrea must get the womanizing Rolf to commit to marriage without first going to bed with him.', 12, 42),  (12, 'https://image.tmdb.org/t/p/w500/kONbgktPKsm3EMj3MiES0IP8BRr.jpg', 'Cavegirl', 'Comedy', 'On a class excursion to a cave with stone age paintings the clumsy Rex gets lost. A mysterious crystal opens a gateway in time and sets him back to the stone ages, where he meets a group of prehistoric fellows and the gorgeous Eba. While teaching her English and doing some pseudo-research on her fellows, his main goal is to get her sleeping with him. However the curiosity of the clan chief disturbs his attempts.', 54, 40),  (13, 'https://image.tmdb.org/t/p/w500/hVXjX1jLZ1ljFSNGXpjJfbTUOa7.jpg', 'Mayday', 'Action', 'When a U.S. Navy pilot on a top-secret mission during the Cold War gets trapped behind enemy lines, his only chance at survival is to form an alliance with an eccentric ex-KGB agent.', 23, 79),  (14, 'https://image.tmdb.org/t/p/w500/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg', 'The Runner', 'Thriller', 'Maia Marten, a brilliant London lawyer, has her life shattered by a single call on her morning run: her son has been taken. To get him back, she must keep running, obey every ruthless command, and trust no one-each second a test of how far a mother will go to save her child.', 100, 67),  (15, 'https://image.tmdb.org/t/p/w500/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg', 'Ghost in the Cell', 'Horror', 'In a notorious prison, an invisible force begins killing inmates brutally, compelling enemy gangs and corrupt guards to work together as they try to survive the mounting bloodshed.', 66, 72),  (16, 'https://image.tmdb.org/t/p/w500/cO7J0XSVKPlAjUCMWC7DVBn1Py2.jpg', 'Zip Wire', 'Action', 'When her ground-breaking pharmaceutical discovery is stolen and partner murdered, researcher Amy must face her fear of heights to escape nefarious attackers, with the only path to salvation being a treacherous aerial runway. To outsmart the mysterious hostiles, she has to summon every ounce of courage to protect the world-changing scientific discovery — and herself — before it''s too late.', 74, 75),  (17, 'https://image.tmdb.org/t/p/w500/mLsvCffzpxxDwC7yVLJSLLjgzoq.jpg', 'Vishwanath & Sons', 'Drama', 'A celebrated Olympian shooter travels to America looking for a donor to help his sick child — but unexpected romance complicates his search.', 68, 73),  (18, 'https://image.tmdb.org/t/p/w500/sfQtVlIHljToOwYjhe21KPGzZWK.jpg', 'Toy Story 5', 'Animation', 'When Bonnie receives a Lilypad tablet as a gift and becomes obsessed, Buzz, Woody, Jessie and the rest of the gang''s jobs become exponentially harder when they have to go head to head with the all-new threat to playtime.', 43, 83),  (19, 'https://image.tmdb.org/t/p/w500/16oqRrWVzQm6qdGfBxvziZ2UiMT.jpg', 'Clash of the Thundermans', 'TV Movie', 'When Chloe develops a destructive new superpower, the Hero League orders her to an elite boarding school for superheroes to learn control of her abilities. Faced with the prospect of sending Chloe away for years, the Thundermans split apart, with Phoebe, Barb and Billy taking her into hiding. Max, Hank, and Nora track their rogue family members, until the two factions face off against each other in a full-on battle for the Thundermans’ future.', 13, 68),  (20, 'https://image.tmdb.org/t/p/w500/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg', 'Obsession', 'Horror', 'After breaking the mysterious "One Wish Willow" to win his crush''s heart, a hopeless romantic finds himself getting exactly what he asked for but soon discovers that some desires come at a dark, sinister price.', 45, 81);
/*!40000 ALTER TABLE `movies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shows`
--

DROP TABLE IF EXISTS `shows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `movie` int DEFAULT NULL,
  `cinema` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `seats` tinyint(1) DEFAULT '100',
  PRIMARY KEY (`id`),
  KEY `cinema_idx` (`cinema`),
  KEY `movie_idx` (`movie`),
  CONSTRAINT `cinema` FOREIGN KEY (`cinema`) REFERENCES `cinema` (`id`),
  CONSTRAINT `movie` FOREIGN KEY (`movie`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shows`
--

LOCK TABLES `shows` WRITE;
/*!40000 ALTER TABLE `shows` DISABLE KEYS */;
-- Sample screenings: two per movie, 19-25 January 2027.
INSERT INTO `shows` (`id`, `movie`, `cinema`, `date`, `time`, `seats`) VALUES
(1, 1, 1, '2027-01-19', '15:00:00', 73),
(2, 2, 2, '2027-01-19', '15:00:00', 41),
(3, 3, 3, '2027-01-19', '15:00:00', 12),
(4, 4, 1, '2027-01-19', '19:00:00', 88),
(5, 5, 2, '2027-01-19', '19:00:00', 27),
(6, 6, 3, '2027-01-19', '19:00:00', 56),
(7, 7, 1, '2027-01-20', '15:00:00', 8),
(8, 8, 2, '2027-01-20', '15:00:00', 64),
(9, 9, 3, '2027-01-20', '15:00:00', 35),
(10, 10, 1, '2027-01-20', '19:00:00', 91),
(11, 11, 2, '2027-01-20', '19:00:00', 18),
(12, 12, 3, '2027-01-20', '19:00:00', 47),
(13, 13, 1, '2027-01-21', '15:00:00', 52),
(14, 14, 2, '2027-01-21', '15:00:00', 23),
(15, 15, 3, '2027-01-21', '15:00:00', 4),
(16, 16, 1, '2027-01-21', '19:00:00', 79),
(17, 17, 2, '2027-01-21', '19:00:00', 44),
(18, 18, 3, '2027-01-21', '19:00:00', 67),
(19, 19, 1, '2027-01-22', '15:00:00', 16),
(20, 20, 2, '2027-01-22', '15:00:00', 31),
(21, 1, 3, '2027-01-22', '15:00:00', 95),
(22, 2, 1, '2027-01-22', '19:00:00', 61),
(23, 3, 2, '2027-01-22', '19:00:00', 9),
(24, 4, 3, '2027-01-22', '19:00:00', 38),
(25, 5, 1, '2027-01-23', '15:00:00', 84),
(26, 6, 2, '2027-01-23', '15:00:00', 29),
(27, 7, 3, '2027-01-23', '15:00:00', 14),
(28, 8, 1, '2027-01-23', '19:00:00', 70),
(29, 9, 2, '2027-01-23', '19:00:00', 49),
(30, 10, 3, '2027-01-23', '19:00:00', 57),
(31, 11, 1, '2027-01-24', '15:00:00', 2),
(32, 12, 2, '2027-01-24', '15:00:00', 76),
(33, 13, 3, '2027-01-24', '15:00:00', 33),
(34, 14, 1, '2027-01-24', '19:00:00', 98),
(35, 15, 2, '2027-01-24', '19:00:00', 19),
(36, 16, 3, '2027-01-24', '19:00:00', 42),
(37, 17, 1, '2027-01-25', '15:00:00', 68),
(38, 18, 2, '2027-01-25', '15:00:00', 25),
(39, 19, 3, '2027-01-25', '15:00:00', 6),
(40, 20, 1, '2027-01-25', '19:00:00', 86);
/*!40000 ALTER TABLE `shows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `number` varchar(50) DEFAULT NULL,
  `newsletter` tinyint NOT NULL DEFAULT 0,
  `fname` varchar(45) DEFAULT NULL,
  `sname` varchar(45) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `sex` varchar(45) DEFAULT NULL,
  `perms` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_username` (`username`),
  UNIQUE KEY `uq_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
-- Supplied development admin account with passwod admin
INSERT INTO `user` (`id`, `username`, `password`, `email`, `number`, `newsletter`, `fname`, `sname`, `dob`, `sex`, `perms`) VALUES
(1, 'admin', '$2b$12$nd0U2wQDKu6M8dl/NzpUKOq6KJN78oF0PqL43Z.YG0ZlRaRpM/n.y', 'a@a.com', '+123', 1, 'admin', 'admin', '2010-01-01', 'attack_helicopter', 1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-06 14:50:52
