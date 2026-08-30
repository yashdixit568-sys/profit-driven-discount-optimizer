import { RetailRow } from "./types";

export const DEMO_CSV_DATA = `Order Date,Ship Date,Customer ID,Customer Name,Segment,Country,City,State,Region,Category,Sub-Category,Product Name,Ship Mode,Sales,Quantity,Discount,Profit
2026-01-05,2026-01-08,CUST-1001,TechCorp Systems,Corporate,United States,San Francisco,California,West,Technology,Phones,iPhone 15 Pro 256GB,Second Class,1999.98,2,0.0,399.99
2026-01-06,2026-01-10,CUST-1002,Jane Doe,Consumer,United States,Seattle,Washington,West,Technology,Accessories,Wireless Mechanical Keyboard,Standard Class,149.50,1,0.1,29.90
2026-01-08,2026-01-12,CUST-1003,Apex Logistics,Corporate,United States,New York,New York,East,Office Supplies,Storage,Heavy Duty File Cabinets,Standard Class,450.00,3,0.0,90.00
2026-01-10,2026-01-11,CUST-1004,Global Media Inc,Enterprise,United States,Chicago,Illinois,Central,Technology,Machines,3D Pro Laser Printer,First Class,2800.00,1,0.2,280.00
2026-01-12,2026-01-15,CUST-1005,Sarah Connor,Consumer,United States,Austin,Texas,South,Furniture,Chairs,Ergonomic Mesh Office Chair,Standard Class,320.00,2,0.15,48.00
2026-01-15,2026-01-19,CUST-1006,David Miller,Consumer,United States,Boston,Massachusetts,East,Furniture,Tables,Executive Oak Desk,Standard Class,850.00,1,0.4,-120.00
2026-01-18,2026-01-20,CUST-1007,BioHealth Labs,Enterprise,United States,San Diego,California,West,Technology,Copiers,High-Speed Document Copier,Second Class,1600.00,1,0.05,400.00
2026-01-20,2026-01-25,CUST-1008,Emily Watson,Consumer,United States,Denver,Colorado,West,Office Supplies,Paper,Premium Multipurpose Paper 500s,Standard Class,45.00,5,0.0,15.00
2026-01-22,2026-01-24,CUST-1009,Starlight Retail,Corporate,United States,Miami,Florida,South,Technology,Phones,5G Enterprise Smartphone,First Class,1200.00,2,0.35,-80.00
2026-01-25,2026-01-28,CUST-1010,Robert Chen,Consumer,United States,Atlanta,Georgia,South,Office Supplies,Binders,Heavy Ring Binders Pack,Second Class,35.00,4,0.1,10.50
2026-02-01,2026-02-04,CUST-1001,TechCorp Systems,Corporate,United States,San Francisco,California,West,Technology,Accessories,4K UltraHD Monitor,Standard Class,599.99,1,0.0,149.99
2026-02-03,2026-02-08,CUST-1011,Marcus Vance,Consumer,United States,Phoenix,Arizona,West,Furniture,Bookcases,Modern 5-Shelf Bookcase,Standard Class,290.00,2,0.3,-25.00
2026-02-05,2026-02-07,CUST-1003,Apex Logistics,Corporate,United States,New York,New York,East,Office Supplies,Appliances,Compact Refrigerator,First Class,310.00,1,0.0,62.00
2026-02-10,2026-02-14,CUST-1012,Elena Rostova,Consumer,United States,Philadelphia,Pennsylvania,East,Technology,Phones,Wireless Charging Pad,Standard Class,80.00,2,0.1,20.00
2026-02-12,2026-02-15,CUST-1004,Global Media Inc,Enterprise,United States,Chicago,Illinois,Central,Furniture,Furnishings,LED Desk Lamp,Second Class,65.00,3,0.0,19.50
2026-02-15,2026-02-20,CUST-1013,James Wilson,Consumer,United States,Dallas,Texas,Central,Technology,Machines,Color Laser Multifunction Printer,Standard Class,1100.00,1,0.45,-210.00
2026-02-18,2026-02-21,CUST-1005,Sarah Connor,Consumer,United States,Austin,Texas,South,Office Supplies,Art,Professional Drawing Markers Set,Same Day,55.00,2,0.0,18.00
2026-02-20,2026-02-25,CUST-1014,Quantum Dynamics,Enterprise,United States,Portland,Oregon,West,Technology,Accessories,Noise-Canceling Headset,Standard Class,249.00,2,0.1,59.00
2026-02-22,2026-02-26,CUST-1007,BioHealth Labs,Enterprise,United States,San Diego,California,West,Office Supplies,Supplies,Heavy Duty Scissors,Second Class,28.00,4,0.0,8.40
2026-02-25,2026-03-01,CUST-1015,Sophia Taylor,Consumer,United States,Minneapolis,Minnesota,Central,Furniture,Chairs,Executive Leather Recliner,Standard Class,680.00,1,0.2,102.00
2026-03-01,2026-03-04,CUST-1002,Jane Doe,Consumer,United States,Seattle,Washington,West,Technology,Phones,Flagship Smartphone 512GB,Standard Class,1199.00,1,0.05,299.00
2026-03-04,2026-03-09,CUST-1016,Lucas Scott,Consumer,United States,Charlotte,North Carolina,South,Office Supplies,Paper,Recycled Copy Paper 10-Pack,Standard Class,120.00,3,0.0,36.00
2026-03-07,2026-03-10,CUST-1009,Starlight Retail,Corporate,United States,Miami,Florida,South,Furniture,Tables,Conference Table 8-Seat,Second Class,1450.00,1,0.5,-350.00
2026-03-10,2026-03-12,CUST-1017,Horizon Analytics,Enterprise,United States,Boston,Massachusetts,East,Technology,Copiers,Enterprise Laser Copier,First Class,3400.00,1,0.1,850.00
2026-03-15,2026-03-19,CUST-1018,Olivia Brown,Consumer,United States,Detroit,Michigan,Central,Office Supplies,Storage,Stackable Storage Bins,Standard Class,85.00,5,0.0,25.50
2026-03-18,2026-03-22,CUST-1001,TechCorp Systems,Corporate,United States,San Francisco,California,West,Technology,Accessories,USB-C Docking Station,Standard Class,199.00,3,0.0,49.75
2026-03-20,2026-03-24,CUST-1019,William Harris,Consumer,United States,Las Vegas,Nevada,West,Furniture,Furnishings,Decorative Wall Clock,Standard Class,42.00,2,0.0,12.60
2026-03-22,2026-03-27,CUST-1003,Apex Logistics,Corporate,United States,New York,New York,East,Technology,Phones,Bluetooth Conference Speaker,Standard Class,299.00,2,0.15,59.80
2026-03-25,2026-03-28,CUST-1020,Emma Davis,Consumer,United States,Indianapolis,Indiana,Central,Office Supplies,Fasteners,Binder Clips Heavy Duty,Second Class,18.00,6,0.0,5.40
2026-03-28,2026-04-01,CUST-1004,Global Media Inc,Enterprise,United States,Chicago,Illinois,Central,Furniture,Chairs,Task Chair with Lumbar Support,Standard Class,210.00,2,0.1,31.50`;
