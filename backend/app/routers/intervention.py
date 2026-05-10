from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_teacher
from app.database import get_db
from app.models.user import User
from app.schemas.intervention import (
    ApprovePlanRequest,
    GeneratePlanRequest,
    InterventionGroupResponse,
    InterventionPlanListItem,
    InterventionPlanResponse,
    LinkWorksheetRequest,
    UpdateGroupRequest,
)
from app.services.intervention_service import InterventionService

router = APIRouter(prefix="/intervention", tags=["Intervention Planner"])


@router.post("/generate", response_model=InterventionPlanResponse)
async def generate_intervention_plan(
    request: GeneratePlanRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    service = InterventionService(db)
    plan = service.generate_plan(
        class_id=request.class_id,
        week_number=request.week_number,
        year=request.year,
        teacher_id=int(teacher.id),
    )
    return service.serialize_plan(plan)


@router.get("/class/{class_id}", response_model=list[InterventionPlanListItem])
async def list_intervention_plans(
    class_id: int,
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    service = InterventionService(db)
    plans = service.get_plans_for_class(class_id=class_id, teacher_id=int(teacher.id), limit=limit)
    return [service.serialize_plan_list_item(plan) for plan in plans]


@router.get("/{plan_id}", response_model=InterventionPlanResponse)
async def get_intervention_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    service = InterventionService(db)
    plan = service.get_plan(plan_id, int(teacher.id))
    return service.serialize_plan(plan)


@router.put("/{plan_id}/approve", response_model=InterventionPlanResponse)
async def approve_intervention_plan(
    plan_id: int,
    request: ApprovePlanRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    service = InterventionService(db)
    plan = service.approve_plan(plan_id=plan_id, teacher_id=int(teacher.id), notes=request.notes)
    return service.serialize_plan(plan)


@router.put("/{plan_id}/complete", response_model=InterventionPlanResponse)
async def complete_intervention_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    service = InterventionService(db)
    plan = service.complete_plan(plan_id=plan_id, teacher_id=int(teacher.id))
    return service.serialize_plan(plan)


@router.put("/groups/{group_id}", response_model=InterventionGroupResponse)
async def update_intervention_group(
    group_id: int,
    request: UpdateGroupRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    service = InterventionService(db)
    group = service.update_group(
        group_id=group_id,
        teacher_id=int(teacher.id),
        updates=request.model_dump(exclude_none=True),
    )
    student_name_map = service.get_student_name_map(group.plan.class_id)
    return service.serialize_group(group, student_name_map)


@router.put("/groups/{group_id}/link-worksheet", response_model=InterventionGroupResponse)
async def link_worksheet_to_group(
    group_id: int,
    request: LinkWorksheetRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    service = InterventionService(db)
    group = service.link_worksheet_to_group(
        group_id=group_id,
        worksheet_id=request.worksheet_id,
        teacher_id=int(teacher.id),
    )
    student_name_map = service.get_student_name_map(group.plan.class_id)
    return service.serialize_group(group, student_name_map)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_intervention_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    service = InterventionService(db)
    service.delete_plan(plan_id=plan_id, teacher_id=int(teacher.id))
    return None
