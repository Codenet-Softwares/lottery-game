import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import {sequelize} from './config/db.js';
import { ticketRoute } from './routes/ticket.route.js';
import { userRoute } from './routes/user.route.js';
import { adminRoutes } from './routes/admin.route.js';
import PurchaseLottery from './models/purchase.model.js';
import UserRange from './models/user.model.js';
import { ResultDeclarationModule } from './routes/ResultDeclaration.route.js';
import { ExternalApiModule } from './routes/externalApis.route.js';
import { voidGameRoute } from './routes/void.route.js';
import { revokeGameRoute } from './routes/revoke.route.js';
import { deleteGameRoute } from './routes/delete.route.js';
import { updateLottery } from './utils/lotteryCron.js';



if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env' });
}

console.log('Running in environment:', process.env.NODE_ENV);

dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = process.env.FRONTEND_URI.split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.send('Production environment is running.');
  } else {
    res.send('Development environment is running.');
  }
});

adminRoutes(app);
ticketRoute(app);
userRoute(app);
ResultDeclarationModule(app);
ExternalApiModule(app);
voidGameRoute(app)
revokeGameRoute(app)
deleteGameRoute(app)

PurchaseLottery.belongsTo(UserRange, {
  foreignKey: 'generateId',
  targetKey: 'generateId',
  as: 'userRange',
});

UserRange.hasMany(PurchaseLottery, {
  foreignKey: 'generateId',
  sourceKey: 'generateId',
  as: 'purchases',
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('DB Synced!');

    app.listen(process.env.PORT, () => {
      console.log(`Server running at http://localhost:${process.env.PORT}`);
    });

    const runLottery = async () => {
      await updateLottery(); // Waits for previous run to complete
      setTimeout(runLottery, 1000); // Runs every second (safely)
    }; 
    runLottery(); // Kick off the loop 
  })
  .catch((err) => {
    console.error('DB Sync Error:', err);
  });


  
  process.on('SIGINT', async () => {
    await sequelize.close();
    process.exit(0);
  });


