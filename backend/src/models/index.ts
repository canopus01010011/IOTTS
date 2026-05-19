import User from './User.js';
import Site from './Site.js';
import Equipment from './Equipment.js';
import Mission from './Mission.js';
import Notification from './Notification.js';
import MissionFile from './MissionFile.js';
import Container from './Container.js';
import GPSDevice from './GPSDevice.js';
import TrackingData from './TrackingData.js';
import Report from './Report.js';
import Picture from './Picture.js';
import Confirmation from './Confirmation.js';

// User associations
User.hasMany(Mission, { as: 'missions_as_technician', foreignKey: 'technician_id' });
User.hasMany(Mission, { as: 'missions_as_driver', foreignKey: 'driver_id' });
User.hasMany(MissionFile, { as: 'imported_mission_files', foreignKey: 'imported_by' });

// Site associations
Site.hasMany(Mission, { foreignKey: 'site_id' });

// Equipment associations
Equipment.belongsTo(Container, { foreignKey: 'container_id' });

// Mission associations
Mission.belongsTo(User, { as: 'technician', foreignKey: 'technician_id' });
Mission.belongsTo(User, { as: 'driver', foreignKey: 'driver_id' });
Mission.belongsTo(Site, { foreignKey: 'site_id' });
Mission.belongsTo(Container, { foreignKey: 'container_id' });
Mission.hasOne(MissionFile, { foreignKey: 'mission_id' });
Mission.hasOne(Confirmation, { foreignKey: 'mission_id' });
Mission.hasOne(Report, { foreignKey: 'mission_id' });

// GPS associations
GPSDevice.belongsTo(Container, { foreignKey: 'container_id' });
GPSDevice.hasMany(TrackingData, { foreignKey: 'gps_id' });
TrackingData.belongsTo(GPSDevice, { foreignKey: 'gps_id' });

// Mission file associations
MissionFile.belongsTo(User, { as: 'importer', foreignKey: 'imported_by' });
MissionFile.belongsTo(Mission, { foreignKey: 'mission_id' });

// Container associations
Container.hasMany(Mission, { foreignKey: 'container_id' });
Container.hasMany(Equipment, { foreignKey: 'container_id' });
Container.hasOne(GPSDevice, { foreignKey: 'container_id' });

// Confirmation, report, and picture associations
Confirmation.belongsTo(Mission, { foreignKey: 'mission_id' });
Report.belongsTo(Mission, { foreignKey: 'mission_id' });
Report.hasMany(Picture, { foreignKey: 'report_id' });
Picture.belongsTo(Report, { foreignKey: 'report_id' });

export {
  User,
  Site,
  Equipment,
  Mission,
  Notification,
  MissionFile,
  Container,
  GPSDevice,
  TrackingData,
  Report,
  Picture,
  Confirmation
};
