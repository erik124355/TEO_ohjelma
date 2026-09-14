-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 14.09.2026 klo 11:37
-- Palvelimen versio: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `teo`
--

-- --------------------------------------------------------

--
-- Rakenne taululle `admin`
--

CREATE TABLE `admin` (
  `AdminID` int(11) NOT NULL,
  `User` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Rakenne taululle `naytto`
--

CREATE TABLE `naytto` (
  `NayttoID` int(11) NOT NULL,
  `Paiva` date DEFAULT NULL,
  `Arvosana` tinyint(4) DEFAULT NULL,
  `Tila` enum('Kesken','Hylätty','Valmis') DEFAULT NULL,
  `Teojakso` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vedos taulusta `naytto`
--

INSERT INTO `naytto` (`NayttoID`, `Paiva`, `Arvosana`, `Tila`, `Teojakso`) VALUES
(1, '2026-09-08', 5, 'Valmis', 1),
(2, '2026-09-08', 5, 'Valmis', 3);

-- --------------------------------------------------------

--
-- Rakenne taululle `paivakirja`
--

CREATE TABLE `paivakirja` (
  `PaivakirjaID` int(11) NOT NULL,
  `Paiva` date DEFAULT NULL,
  `Paivitys` varchar(255) DEFAULT NULL,
  `Opiskelija` int(11) DEFAULT NULL,
  `Teojakso` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vedos taulusta `paivakirja`
--

INSERT INTO `paivakirja` (`PaivakirjaID`, `Paiva`, `Paivitys`, `Opiskelija`, `Teojakso`) VALUES
(1, '2026-09-09', 'test', 3, 3);

-- --------------------------------------------------------

--
-- Rakenne taululle `teojakso`
--

CREATE TABLE `teojakso` (
  `TeojaksoID` int(11) NOT NULL,
  `Alku` date DEFAULT NULL,
  `Loppu` date DEFAULT NULL,
  `Tyopaikka` varchar(255) DEFAULT NULL,
  `Opiskelija` int(11) DEFAULT NULL,
  `Opettaja` int(11) DEFAULT NULL,
  `Ohjaaja` int(11) DEFAULT NULL,
  `Paivakirja` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vedos taulusta `teojakso`
--

INSERT INTO `teojakso` (`TeojaksoID`, `Alku`, `Loppu`, `Tyopaikka`, `Opiskelija`, `Opettaja`, `Ohjaaja`, `Paivakirja`) VALUES
(1, '2026-09-01', '2026-09-30', 'Test', 2, 1, 6, NULL),
(2, '2026-09-04', '2026-09-25', 'test1', 2, 1, NULL, NULL),
(3, '2026-09-10', '2026-09-13', 'testr', 3, 1, 6, NULL);

-- --------------------------------------------------------

--
-- Rakenne taululle `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Role` enum('Oppilas','Opettaja','Ohjaaja') DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `Luokka` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vedos taulusta `users`
--

INSERT INTO `users` (`UserID`, `Role`, `Name`, `Password`, `Luokka`) VALUES
(1, 'Opettaja', 'Maija', '$2b$10$TCo6jy6UG/ZQLOAmG4DvT.tF8nvuzpbL2vEQ3KQwyDzRvownTMs1u', NULL),
(2, 'Oppilas', 'Matti', '$2b$10$rJhq618FxSpngEfBnHTIu.ZXRdagYkRdvrXAIv5mJqJfYmoYEFTcO', 'K3TVT25A'),
(3, 'Oppilas', 'Helka', '$2b$10$LIhfHZbrZa8a1.wro2Wpk.yyeVIWZpHW/3iJ3qz7hJCKExUvn2ImG', 'K3TVT24C'),
(4, 'Oppilas', 'Mikko', '$2b$10$iBtoUMtStl5kNLunJC2OKeu4qvropePwBgP18A/fHCqdNlt2QC98i', 'K3TVT24D'),
(6, 'Ohjaaja', 'Misa', '$2b$10$sN3qHfGKf7fD4O8kFGBvkeelQ/EExSYKRK0FXq8.UHvPXSmGHz1Fm', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`AdminID`);

--
-- Indexes for table `naytto`
--
ALTER TABLE `naytto`
  ADD PRIMARY KEY (`NayttoID`),
  ADD KEY `Teojakso` (`Teojakso`);

--
-- Indexes for table `paivakirja`
--
ALTER TABLE `paivakirja`
  ADD PRIMARY KEY (`PaivakirjaID`),
  ADD KEY `Opiskelija` (`Opiskelija`),
  ADD KEY `paivakirja_ibfk_2` (`Teojakso`);

--
-- Indexes for table `teojakso`
--
ALTER TABLE `teojakso`
  ADD PRIMARY KEY (`TeojaksoID`),
  ADD KEY `Opiskelija` (`Opiskelija`),
  ADD KEY `Opettaja` (`Opettaja`),
  ADD KEY `Ohjaaja` (`Ohjaaja`),
  ADD KEY `Paivakirja` (`Paivakirja`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `AdminID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `naytto`
--
ALTER TABLE `naytto`
  MODIFY `NayttoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `paivakirja`
--
ALTER TABLE `paivakirja`
  MODIFY `PaivakirjaID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `teojakso`
--
ALTER TABLE `teojakso`
  MODIFY `TeojaksoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Rajoitteet vedostauluille
--

--
-- Rajoitteet taululle `naytto`
--
ALTER TABLE `naytto`
  ADD CONSTRAINT `naytto_ibfk_1` FOREIGN KEY (`Teojakso`) REFERENCES `teojakso` (`TeojaksoID`);

--
-- Rajoitteet taululle `paivakirja`
--
ALTER TABLE `paivakirja`
  ADD CONSTRAINT `paivakirja_ibfk_1` FOREIGN KEY (`Opiskelija`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `paivakirja_ibfk_2` FOREIGN KEY (`Teojakso`) REFERENCES `teojakso` (`TeojaksoID`) ON DELETE CASCADE;

--
-- Rajoitteet taululle `teojakso`
--
ALTER TABLE `teojakso`
  ADD CONSTRAINT `teojakso_ibfk_1` FOREIGN KEY (`Opiskelija`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `teojakso_ibfk_2` FOREIGN KEY (`Opettaja`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `teojakso_ibfk_3` FOREIGN KEY (`Ohjaaja`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `teojakso_ibfk_4` FOREIGN KEY (`Paivakirja`) REFERENCES `paivakirja` (`PaivakirjaID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
