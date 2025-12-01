import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from geopy.distance import geodesic
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from dotenv import load_dotenv

# 1. 환경 변수 로드
load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

app = FastAPI()

# 2. CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. 데이터 모델
class Location(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    # React에서 오는 추가 필드 대응 (Optional)
    type: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None

class RequestBody(BaseModel):
    places: List[Location]
    days: int = 3  # 기본값 3일

# 4. 거리 매트릭스 생성 (기존 유지)
def create_distance_matrix(locations):
    matrix = []
    for i in range(len(locations)):
        row = []
        for j in range(len(locations)):
            if i == j:
                row.append(0)
            else:
                loc_i = (locations[i].lat, locations[i].lng)
                loc_j = (locations[j].lat, locations[j].lng)
                dist = int(geodesic(loc_i, loc_j).meters)
                row.append(dist)
        matrix.append(row)
    return matrix

# 5. TSP 알고리즘 (기존 유지)
def solve_tsp(distance_matrix):
    if not distance_matrix or len(distance_matrix) < 2:
        return list(range(len(distance_matrix)))

    manager = pywrapcp.RoutingIndexManager(len(distance_matrix), 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        index = routing.Start(0)
        route_indices = []
        while not routing.IsEnd(index):
            route_indices.append(manager.IndexToNode(index))
            index = solution.Value(routing.NextVar(index))
        return route_indices
    return list(range(len(distance_matrix)))

# 6. API 엔드포인트 (수정됨: 3일차 분할 로직)
@app.post("/optimize")
async def optimize_route(body: RequestBody):
    places = body.places
    days = body.days
    
    if not places:
        return {"optimized_places": []}
    
    # [Step 1] 지역적 근접성을 위해 위도(Latitude) 기준으로 정렬 (북->남)
    # 복잡한 클러스터링 대신 위도로 자르면 여행 동선이 자연스럽게 나뉩니다.
    sorted_places = sorted(places, key=lambda x: x.lat, reverse=True)
    
    # [Step 2] 3개 그룹으로 나누기 (Chunking)
    chunk_size = len(sorted_places) / days
    daily_groups = []
    
    for i in range(days):
        start = int(i * chunk_size)
        end = int((i + 1) * chunk_size)
        if i == days - 1: # 마지막 날은 나머지 전부 포함
            daily_groups.append(sorted_places[start:])
        else:
            daily_groups.append(sorted_places[start:end])

    # [Step 3] 각 그룹별로 TSP 수행
    final_routes = []
    for group in daily_groups:
        if len(group) < 2:
            final_routes.append(group)
        else:
            matrix = create_distance_matrix(group)
            indices = solve_tsp(matrix)
            optimized_group = [group[i] for i in indices]
            final_routes.append(optimized_group)
    
    # 반환 형식: [[Day1 장소들], [Day2 장소들], [Day3 장소들]]
    return {"optimized_places": final_routes}