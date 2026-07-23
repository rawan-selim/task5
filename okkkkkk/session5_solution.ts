
import express, { Request, Response, NextFunction } from 'express';

// Task 1
const app = express();
const PORT = 3000;

app.use(express.json());

// Task 2
export interface Rating {
  [passengerName: string]: number;
}

export interface Microbus {
  id: number;
  driverName: string;
  route: string;
  farePerSeat: number;
  seatsAvailable: number;
  ratings: Record<string, number>[];
}

export const fleet: Microbus[] = [
  {
    id: 1,
    driverName: "Mohamed",
    route: "Mohandessin - Ramses",
    farePerSeat: 8,
    seatsAvailable: 14,
    ratings: [{ Hossam: 5 }, { Mona: 4 }]
  },
  {
    id: 2,
    driverName: "Sayed",
    route: "Haram - Dokki",
    farePerSeat: 10,
    seatsAvailable: 12,
    ratings: [{ Hossam: 3 }]
  },
  {
    id: 3,
    driverName: "Hassan",
    route: "Shobra - Giza",
    farePerSeat: 12,
    seatsAvailable: 0,
    ratings: [{ Mohamed: 4 }]
  },
  {
    id: 4,
    driverName: "Khaled",
    route: "Maadi - Tahrir",
    farePerSeat: 7,
    seatsAvailable: 6,
    ratings: []
  }
];

// Task 9
const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
};

const validateMicrobus = (req: Request, res: Response, next: NextFunction) => {
  const { driverName, route, farePerSeat, seatsAvailable } = req.body;

  if (req.method === 'POST') {
    if (!driverName || !route || farePerSeat === undefined || seatsAvailable === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  }

  if (farePerSeat !== undefined && farePerSeat < 0) {
    return res.status(400).json({ message: "farePerSeat cannot be negative" });
  }

  if (seatsAvailable !== undefined && seatsAvailable < 0) {
    return res.status(400).json({ message: "seatsAvailable cannot be negative" });
  }

  next();
};

app.use(loggerMiddleware);

// Task 7
app.get('/fleet/filter', (req: Request, res: Response) => {
  const { maxFare } = req.query;

  if (!maxFare) {
    return res.status(400).json({ message: "maxFare query parameter is required" });
  }

  const limit = Number(maxFare);
  const result = fleet.filter(b => b.farePerSeat <= limit);
  res.status(200).json(result);
});

// Task 8
app.get('/fleet/rate/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { rater } = req.query;

  if (!id || !rater) {
    return res.status(400).json({ message: "id and rater are required" });
  }

  const bus = fleet.find(b => b.id === id);
  if (!bus) {
    return res.status(404).json({ message: "Am Ashraf doesn't run that one" });
  }

  const raterName = String(rater).toLowerCase();
  let foundRating: number | null = null;

  for (const rObj of bus.ratings) {
    const key = Object.keys(rObj)[0];
    if (key.toLowerCase() === raterName) {
      foundRating = rObj[key];
      break;
    }
  }

  if (foundRating === null) {
    return res.status(200).json({ message: `${rater} has not rated this microbus` });
  }

  res.status(200).json({ id: bus.id, rater: rater, rate: foundRating });
});

// Task 3
app.get('/fleet', (req: Request, res: Response) => {
  res.status(200).json(fleet);
});

app.get('/fleet/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const bus = fleet.find(b => b.id === id);

  if (!bus) {
    return res.status(404).json({ message: "Am Ashraf doesn't run that one" });
  }

  res.status(200).json(bus);
});

// Task 4
app.post('/fleet', validateMicrobus, (req: Request, res: Response) => {
  const { driverName, route, farePerSeat, seatsAvailable } = req.body;

  const newId = fleet.length > 0 ? Math.max(...fleet.map(b => b.id)) + 1 : 1;

  const newBus: Microbus = {
    id: newId,
    driverName,
    route,
    farePerSeat: Number(farePerSeat),
    seatsAvailable: Number(seatsAvailable),
    ratings: []
  };

  fleet.push(newBus);
  res.status(201).json(newBus);
});

// Task 5
app.put('/fleet/:id', validateMicrobus, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const busIndex = fleet.findIndex(b => b.id === id);

  if (busIndex === -1) {
    return res.status(404).json({ message: "Am Ashraf doesn't run that one" });
  }

  fleet[busIndex] = {
    ...fleet[busIndex],
    ...req.body
  };

  res.status(200).json(fleet[busIndex]);
});

// Task 6
app.delete('/fleet/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const busIndex = fleet.findIndex(b => b.id === id);

  if (busIndex === -1) {
    return res.status(404).json({ message: "Am Ashraf doesn't run that one" });
  }

  fleet.splice(busIndex, 1);
  res.status(200).json({ message: "Microbus removed successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});