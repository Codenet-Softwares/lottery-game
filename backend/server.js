import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import sequelize from './config/db.js';
import { ticketRoute } from './routes/ticket.route.js';
import { userRoute } from './routes/user.route.js';
import { adminRoutes } from './routes/admin.route.js';
import PurchaseLottery from './models/purchase.model.js';
import UserRange from './models/user.model.js';
import { ResultDeclarationModule } from './routes/ResultDeclaration.route.js';
import { ExternalApiModule } from './routes/externalApis.route.js';
import { voidGameRoute } from './routes/void.route.js';
import TicketRange from './models/ticketRange.model.js';
import cron from 'node-cron'
import { Op } from 'sequelize';
import moment from 'moment';
import { revokeGameRoute } from './routes/revoke.route.js';
import { deleteGameRoute } from './routes/delete.route.js';
import { getISTTime } from './utils/commonMethods.js';

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
  targetKey: 'generateId', // Assuming `generateId` links them
  as: 'userRange',
});

UserRange.hasMany(PurchaseLottery, {
  foreignKey: 'generateId',
  sourceKey: 'generateId',
  as: 'purchases',
});

const clients = new Set();

// SSE endpoint
app.get('/lottery-events', (req, res) => {
  console.log("[SSE] Client connected to events");

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'https://cg.user.dummydoma.in'); // change with server URl when deploy
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.flushHeaders();

  clients.add(res);
  console.log(`[SSE] Connected clients: ${clients.size}`);

  const initialMessage = { message: "SSE service is connected successfully!" };
  res.write(`data: ${JSON.stringify(initialMessage)}\n\n`);

  const heartbeatInterval = setInterval(() => {
    res.write(':\n\n'); // Keep the connection alive
  }, 2000);

  req.on('close', () => {
    console.log('[SSE] Client disconnected');
    clearInterval(heartbeatInterval);
    clients.delete(res);
  });
});


sequelize
  .sync({ alter: false })
  .then(() => {
    console.log('Database & tables created!');
    app.listen(process.env.PORT, () => {
      console.log(`App is running on - http://localhost:${process.env.PORT || 7000}`);
    });

    const updatedMarketsCache = new Map(); 

    // Function to get current time in IST
    cron.schedule('* * * * * * *', async () => {
      try {
        const currentTime = getISTTime();

        const suspendMarkets = await TicketRange.findAll({
          where: {
            isActive: true,
            [Op.or]: [
              { start_time: { [Op.gt]: currentTime } },
              { end_time: { [Op.lt]: currentTime } }
            ]
          },
        });

        const activeMarkets = await TicketRange.findAll({
          where: {
            isActive: false,
            start_time: { [Op.lte]: currentTime },
            end_time: { [Op.gte]: currentTime },
          },
        });

        const updateMarket = [];

        // Update active markets
        for (const market of activeMarkets) {
          if (!updatedMarketsCache.has(market.marketId) || updatedMarketsCache.get(market.marketId).isActive !== true) {
            market.isActive = true;
            market.hideMarketUser = true
            const response = await market.save();
            updateMarket.push(response.toJSON());
            updatedMarketsCache.set(market.marketId, response.toJSON());
          }
        }

        // Update suspend markets
        for (const market of suspendMarkets) {
          if (!updatedMarketsCache.has(market.marketId) || updatedMarketsCache.get(market.marketId).isActive !== false) {
            market.isActive = false;
            const response = await market.save();
            updateMarket.push(response.toJSON());
            updatedMarketsCache.set(market.marketId, response.toJSON());
          }
        }

        clients.forEach((client) => {
          try {
            client.write(`data: ${JSON.stringify(updateMarket)}\n\n`);
          } catch (err) {
            console.error('[SSE] Error sending data to client:', err);
          }
        });

        console.log(`[SSE] Updates broadcasted: ${JSON.stringify(updateMarket)}`);

      } catch (error) {
        console.error('Error checking market statuses:', error);
      }
    });
  })
  .catch((err) => {
    console.error('Unable to create tables:', err);
  });
